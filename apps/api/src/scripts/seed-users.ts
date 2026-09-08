import { PrismaClient as SsoPrismaClient, SpartaModuleId, UserRole, PasswordState, UserStatus } from "@prisma/client";
import { Client as PgClient } from "pg";

const ssoPrisma = new SsoPrismaClient();

async function queryBuildingUsers() {
  const client = new PgClient({ connectionString: 'postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/building?sslmode=disable' });
  await client.connect();
  const res = await client.query("SELECT email_sat, jabatan, nama_lengkap, cabang FROM user_cabang");
  await client.end();
  return res.rows.map(r => ({
    email: r.email_sat,
    role: r.jabatan,
    fullName: r.nama_lengkap,
    branch: r.cabang
  }));
}

async function queryEnergyUsers() {
  const client = new PgClient({ connectionString: 'postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/energy?sslmode=disable' });
  await client.connect();
  const res = await client.query("SELECT email, role, full_name, branch FROM users");
  await client.end();
  return res.rows.map(r => ({
    email: r.email,
    role: r.role,
    fullName: r.full_name,
    branch: r.branch
  }));
}

async function queryMaintenanceUsers() {
  const client = new PgClient({ connectionString: 'postgresql://aku-sparta:0hhUTvTHKtgkN8TfLadC@103.127.99.241:5432/maintenance?sslmode=disable' });
  await client.connect();
  const res = await client.query('SELECT email, role, name as "fullName", "branchNames" FROM "User"');
  await client.end();
  return res.rows.map(r => ({
    email: r.email,
    role: r.role,
    fullName: r.fullName,
    branchNames: r.branchNames
  }));
}

type MergedUser = {
  email: string;
  fullName: string;
  roles: {
    building?: string;
    energy?: string;
    maintenance?: string;
  };
  validBranchNames: Set<string>;
};

async function main() {
  console.log("Fetching users from Building...");
  const buildingUsers = await queryBuildingUsers();
  
  console.log("Fetching users from Energy...");
  const energyUsers = await queryEnergyUsers();
  
  console.log("Fetching users from Maintenance...");
  const maintenanceUsers = await queryMaintenanceUsers();

  console.log("Merging users...");
  const userMap = new Map<string, MergedUser>();

  const getOrInitUser = (email: string, fullName: string | null) => {
    email = email.toLowerCase().trim();
    if (!userMap.has(email)) {
      userMap.set(email, {
        email,
        fullName: fullName || email,
        roles: {},
        validBranchNames: new Set()
      });
    }
    const user = userMap.get(email)!;
    if (fullName && (!user.fullName || user.fullName === email)) {
      user.fullName = fullName;
    }
    return user;
  };

  for (const u of buildingUsers) {
    if (!u.email) continue;
    const user = getOrInitUser(u.email, u.fullName);
    user.roles.building = u.role || "USER";
    if (u.branch) {
      user.validBranchNames.add(u.branch.trim());
    }
  }

  for (const u of energyUsers) {
    if (!u.email) continue;
    const user = getOrInitUser(u.email, u.fullName);
    user.roles.energy = u.role || "USER";
    if (!u.branch) {
      user.validBranchNames.add("HEAD OFFICE");
    } else {
      const branches = u.branch.split(",").map((b: string) => b.trim());
      for (const b of branches) {
        if (b) user.validBranchNames.add(b);
      }
    }
  }

  for (const u of maintenanceUsers) {
    if (!u.email) continue;
    const user = getOrInitUser(u.email, u.fullName);
    user.roles.maintenance = u.role || "USER";
    if (u.branchNames && Array.isArray(u.branchNames)) {
      for (const b of u.branchNames) {
        if (b) user.validBranchNames.add(b.trim());
      }
    }
  }

  console.log(`Merged into ${userMap.size} unique users.`);

  console.log("Clearing old SSO data...");
  await ssoPrisma.session.deleteMany();
  await ssoPrisma.moduleLaunch.deleteMany();
  await ssoPrisma.auditEvent.deleteMany();
  await ssoPrisma.userModuleAccess.deleteMany();
  await ssoPrisma.user.deleteMany();
  
  console.log("Inserting merged users into SSO...");
  
  let inserted = 0;
  for (const u of userMap.values()) {
    const branches = Array.from(u.validBranchNames);
    const primaryBranchCode = branches[0] || "HEAD OFFICE";
    const primaryBranchName = branches[0] || "HEAD OFFICE";
    
    // Ensure branch exists
    let branch = await ssoPrisma.branch.findUnique({ where: { code: primaryBranchCode } });
    if (!branch) {
      branch = await ssoPrisma.branch.create({
        data: {
          code: primaryBranchCode,
          name: primaryBranchName
        }
      });
    }

    const accesses = [];
    if (u.roles.building) {
      accesses.push({
        moduleId: SpartaModuleId.BUILDING,
        role: u.roles.building,
        isActive: true
      });
    }
    if (u.roles.energy) {
      accesses.push({
        moduleId: SpartaModuleId.ENERGY,
        role: u.roles.energy,
        isActive: true
      });
    }
    if (u.roles.maintenance) {
      accesses.push({
        moduleId: SpartaModuleId.MAINTENANCE,
        role: u.roles.maintenance,
        isActive: true
      });
    }

    await ssoPrisma.user.create({
      data: {
        email: u.email,
        fullName: u.fullName,
        branchId: branch.id,
        validBranchNames: branches,
        role: UserRole.USER,
        passwordState: PasswordState.BRANCH_DEFAULT,
        status: UserStatus.ACTIVE,
        accesses: {
          create: accesses
        }
      }
    });

    inserted++;
    if (inserted % 50 === 0) {
      console.log(`Inserted ${inserted} / ${userMap.size}`);
    }
  }

  console.log("Done seeding SSO users!");
}

main()
  .catch(console.error)
  .finally(() => ssoPrisma.$disconnect());

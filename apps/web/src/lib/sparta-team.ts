type SpartaTeamMember = {
  name: string
  role: string
  image: string
}

const primaryDevelopmentTeam = [
  {
    name: "Andy Mulyono",
    role: "Building, Maintenance & Energy System Manager",
    image: "/team/andy-m.jpg",
  },
  {
    name: "Bima Arya Bhagaskara",
    role: "Building, Maintenance & Energy System Specialist",
    image: "/team/bima.webp",
  },
  {
    name: "Syahid Jaya Dilaga",
    role: "Building, Maintenance & Energy System Specialist",
    image: "/team/jaya.jpg",
  },
  {
    name: "M. Iqbal Humris",
    role: "Building, Maintenance & Energy System Specialist",
    image: "/team/m-iqbal.jpg",
  },
] satisfies SpartaTeamMember[]

const otherDevelopmentTeam = [
  {
    name: "Daniel Bernard Yonathan",
    role: "Project Leader (1st Gen)",
    image: "/team/daniel.jpg",
  },
  {
    name: "Ananda Dwi Rizkyta",
    role: "Project Assistant (1st Gen)",
    image: "/team/ananda.webp",
  },
  {
    name: "Nathanael Bernike",
    role: "Project Assistant (1st Gen)",
    image: "/team/nathan.jpg",
  },
  {
    name: "I Putu Dharma Puspa",
    role: "Project Assistant (1st Gen)",
    image: "/team/putu.jpg",
  },
  {
    name: "Dimas Abidzar Fadly",
    role: "Frontend Developer (2nd Gen)",
    image: "/team/dimas.webp",
  },
  {
    name: "Charderra Bagas Eka Sanjaya",
    role: "Backend Developer (2nd Gen)",
    image: "/team/bagas.webp",
  },
  {
    name: "Akmal Zaidan Hibatullah",
    role: "Fullstack Developer (2nd Gen)",
    image: "/team/akmal.webp",
  },
  {
    name: "Ardhan Anggana Prasetya",
    role: "IoT Engineer (2nd Gen)",
    image: "/team/ardhan.jpg",
  },
  {
    name: "Wildan Fadillah",
    role: "Fullstack Developer (3rd Gen)",
    image: "/team/wildan.jpg",
  },
  {
    name: "Wardan Nugraha Ahmad",
    role: "Fullstack Developer (3rd Gen)",
    image: "/team/wardan.jpg",
  },
] satisfies SpartaTeamMember[]

export type { SpartaTeamMember }
export { otherDevelopmentTeam, primaryDevelopmentTeam }

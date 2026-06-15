type SpartaTeamMember = {
  name: string
  role: string
  image: string
}

const primaryDevelopmentTeam = [
  {
    name: "Andy Mulyono",
    role: "Building, Maintenance & Energy System Manager",
    image: "",
  },
  {
    name: "Bima Arya Bhagaskara",
    role: "Building, Maintenance & Energy System Specialist",
    image: "",
  },
  {
    name: "Syahid Jaya Dilaga",
    role: "Building, Maintenance & Energy System Specialist",
    image: "",
  },
  {
    name: "M. Iqbal Humris",
    role: "Building, Maintenance & Energy System Specialist",
    image: "",
  },
] satisfies SpartaTeamMember[]

const otherDevelopmentTeam = [
  {
    name: "Daniel Bernard Yonathan",
    role: "Project Leader (1st Gen)",
    image: "",
  },
  {
    name: "Ananda Dwi Rizkyta",
    role: "Project Assistant (1st Gen)",
    image: "",
  },
  {
    name: "Nathanael Bernike",
    role: "Project Assistant (1st Gen)",
    image: "",
  },
  {
    name: "I Putu Dharma Puspa",
    role: "Project Assistant (1st Gen)",
    image: "",
  },
  {
    name: "Dimas Abidzar Fadly",
    role: "Frontend Developer (2nd Gen)",
    image: "",
  },
  {
    name: "Charderra Bagas Eka Sanjaya",
    role: "Backend Developer (2nd Gen)",
    image: "",
  },
  {
    name: "Akmal Zaidan Hibatullah",
    role: "Fullstack Developer (2nd Gen)",
    image: "",
  },
  {
    name: "Ardhan Anggana Prasetya",
    role: "IoT Engineer (2nd Gen)",
    image: "",
  },
  {
    name: "Wildan Fadillah",
    role: "Fullstack Developer (3rd Gen)",
    image: "",
  },
  {
    name: "Wardan Nugraha Ahmad",
    role: "Fullstack Developer (3rd Gen)",
    image: "",
  },
] satisfies SpartaTeamMember[]

export type { SpartaTeamMember }
export { otherDevelopmentTeam, primaryDevelopmentTeam }

export const WEIGHT_CLASSES = ["Flyweight", "Bantamweight", "Featherweight", "Lightweight", "Welterweight", "Middleweight", "Light Heavyweight", "Heavyweight"];
export const STYLES = ["Striker", "Wrestler", "Grappler", "Balanced"];
export const STAT_KEYS = ["striking", "wrestling", "grappling", "cardio", "power", "speed", "defense", "chin", "submissionOffense", "submissionDefense", "fightIQ", "durability"];
export const TRAINING_OPTIONS = [
  { id: "striking", label: "Striking Drills", focus: "striking", secondary: ["speed", "fightIQ"], energyCost: 11 },
  { id: "wrestling", label: "Wrestling Room", focus: "wrestling", secondary: ["cardio", "durability"], energyCost: 12 },
  { id: "grappling", label: "Grappling Rounds", focus: "grappling", secondary: ["submissionOffense", "submissionDefense"], energyCost: 11 },
  { id: "cardio", label: "Cardio Block", focus: "cardio", secondary: ["durability", "speed"], energyCost: 9 },
  { id: "power", label: "Power Lifting", focus: "power", secondary: ["chin", "durability"], energyCost: 12 },
  { id: "speed", label: "Speed Work", focus: "speed", secondary: ["striking", "defense"], energyCost: 9 },
  { id: "defense", label: "Defense Lab", focus: "defense", secondary: ["fightIQ", "chin"], energyCost: 8 },
  { id: "chin", label: "Toughness Sparring", focus: "chin", secondary: ["durability", "defense"], energyCost: 13 },
  { id: "submissionOffense", label: "Submission Chains", focus: "submissionOffense", secondary: ["grappling", "fightIQ"], energyCost: 10 },
  { id: "submissionDefense", label: "Escape Training", focus: "submissionDefense", secondary: ["grappling", "defense"], energyCost: 9 },
  { id: "fightIQ", label: "Film Study", focus: "fightIQ", secondary: ["defense", "submissionDefense"], energyCost: 5 },
  { id: "durability", label: "Conditioning Base", focus: "durability", secondary: ["cardio", "chin"], energyCost: 8 },
  { id: "recovery", label: "Recovery Week", focus: null, secondary: [], energyCost: 0 }
];

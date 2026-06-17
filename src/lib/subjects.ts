export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  description: string;
  topics: string[];
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  type: '3d' | 'simulation' | 'visualization' | 'quiz' | 'activity';
  description: string;
  icon: string;
  path: string;
}

export const SUBJECTS: Subject[] = [
  {
    id: 'biology',
    name: 'Biology',
    icon: '🧬',
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Explore life sciences through interactive 3D models and simulations',
    topics: ['Cell Biology', 'Genetics', 'Evolution', 'Ecology', 'Photosynthesis', 'Human Anatomy', 'Microbiology'],
    modules: [
      { id: 'cell-explorer', title: '3D Cell Explorer', type: '3d', description: 'Explore human cell organelles in 3D', icon: '🔬', path: '/explore/cell' },
      { id: 'dna-model', title: 'DNA Structure', type: '3d', description: 'Interactive DNA double helix', icon: '🧬', path: '/explore/dna' },
      { id: 'bio-quiz', title: 'Biology Quiz', type: 'quiz', description: 'Test your biology knowledge', icon: '📝', path: '/quiz/biology' },
    ]
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    icon: '⚗️',
    color: '#f59e0b',
    gradient: 'from-amber-500 to-orange-600',
    description: 'Experiment with chemical reactions and molecular structures',
    topics: ['Periodic Table', 'Chemical Bonds', 'Reactions', 'Acids & Bases', 'Organic Chemistry', 'Electrochemistry'],
    modules: [
      { id: 'periodic-table', title: 'AI Periodic Table', type: 'visualization', description: 'Interactive periodic table with AI', icon: '⚗️', path: '/explore/periodic-table' },
      { id: 'chem-sim', title: 'Reaction Simulator', type: 'simulation', description: 'Simulate chemical reactions', icon: '🧪', path: '/simulate/chemistry' },
      { id: 'atom-builder', title: 'Atom Builder', type: '3d', description: 'Build atomic structures in 3D', icon: '⚛️', path: '/explore/atom' },
    ]
  },
  {
    id: 'physics',
    name: 'Physics',
    icon: '⚡',
    color: '#3b82f6',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'Discover the laws of nature through interactive experiments',
    topics: ['Mechanics', 'Thermodynamics', 'Waves', 'Optics', 'Electromagnetism', 'Quantum Physics', 'Relativity'],
    modules: [
      { id: 'physics-lab', title: 'Physics Lab', type: 'simulation', description: 'Gravity, motion, and force experiments', icon: '🔭', path: '/simulate/physics' },
      { id: 'solar-system', title: 'Solar System', type: '3d', description: '3D interactive solar system', icon: '🪐', path: '/explore/solar-system' },
      { id: 'waves-sim', title: 'Wave Simulator', type: 'simulation', description: 'Visualize wave phenomena', icon: '〰️', path: '/explore/waves' },
    ]
  },
  {
    id: 'mathematics',
    name: 'Mathematics',
    icon: '🔢',
    color: '#8b5cf6',
    gradient: 'from-violet-500 to-purple-600',
    description: 'Master mathematical concepts through visual problem solving',
    topics: ['Algebra', 'Calculus', 'Geometry', 'Statistics', 'Linear Algebra', 'Number Theory', 'Trigonometry'],
    modules: [
      { id: 'math-tutor', title: 'AI Math Tutor', type: 'activity', description: 'Step-by-step problem solving', icon: '🧮', path: '/workspace/mathematics' },
      { id: 'graph-explorer', title: 'Graph Explorer', type: 'visualization', description: 'Interactive function grapher', icon: '📈', path: '/simulate/math' },
      { id: 'math-quiz', title: 'Math Quiz', type: 'quiz', description: 'Adaptive math challenges', icon: '📝', path: '/quiz/mathematics' },
    ]
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    icon: '💻',
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-blue-600',
    description: 'Learn algorithms and data structures through animated visualizations',
    topics: ['Algorithms', 'Data Structures', 'Programming', 'AI/ML', 'Networking', 'Databases', 'Security'],
    modules: [
      { id: 'ds-visualizer', title: 'Data Structures', type: 'visualization', description: 'Animated algorithms and structures', icon: '🌳', path: '/explore/data-structures' },
      { id: 'sorting-viz', title: 'Sorting Algorithms', type: 'simulation', description: 'Watch sorting algorithms work', icon: '📊', path: '/explore/sorting' },
      { id: 'cs-quiz', title: 'CS Quiz', type: 'quiz', description: 'Test your CS knowledge', icon: '📝', path: '/quiz/computer-science' },
    ]
  },
  {
    id: 'robotics',
    name: 'Robotics',
    icon: '🤖',
    color: '#f97316',
    gradient: 'from-orange-500 to-red-600',
    description: 'Build and program virtual robots in interactive environments',
    topics: ['Robot Kinematics', 'Sensors', 'Actuators', 'Control Systems', 'Computer Vision', 'Path Planning'],
    modules: [
      { id: 'robot-sim', title: 'Robot Simulator', type: 'simulation', description: 'Program and simulate robots', icon: '🤖', path: '/workspace/robotics' },
      { id: 'circuit-builder', title: 'Circuit Builder', type: 'activity', description: 'Design electronic circuits', icon: '⚙️', path: '/explore/circuits' },
    ]
  },
  {
    id: 'electronics',
    name: 'Electronics',
    icon: '⚙️',
    color: '#eab308',
    gradient: 'from-yellow-500 to-amber-600',
    description: 'Design and simulate electronic circuits',
    topics: ['Circuit Theory', 'Resistors', 'Capacitors', 'Transistors', 'Logic Gates', 'Microcontrollers'],
    modules: [
      { id: 'circuit-sim', title: 'Circuit Simulator', type: 'simulation', description: 'Build and test circuits', icon: '⚡', path: '/explore/circuits' },
      { id: 'logic-gates', title: 'Logic Gates', type: 'visualization', description: 'Interactive logic gate builder', icon: '🔌', path: '/explore/logic-gates' },
    ]
  },
  {
    id: 'medicine',
    name: 'Medicine',
    icon: '🏥',
    color: '#ef4444',
    gradient: 'from-red-500 to-rose-600',
    description: 'Study human anatomy and medical concepts interactively',
    topics: ['Anatomy', 'Physiology', 'Pharmacology', 'Pathology', 'Immunology', 'Cardiology', 'Neurology'],
    modules: [
      { id: 'anatomy-3d', title: 'Human Anatomy', type: '3d', description: '3D human body explorer', icon: '🫁', path: '/explore/anatomy' },
      { id: 'heart-sim', title: 'Heart Simulator', type: 'simulation', description: 'Cardiac function simulation', icon: '❤️', path: '/workspace/medicine' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance',
    icon: '💰',
    color: '#22c55e',
    gradient: 'from-green-500 to-emerald-600',
    description: 'Master financial concepts through real-time simulations',
    topics: ['Investment', 'Compound Interest', 'Stock Markets', 'Bonds', 'Risk Management', 'Portfolio Theory'],
    modules: [
      { id: 'investment-sim', title: 'Investment Simulator', type: 'simulation', description: 'Simulate investment growth', icon: '📈', path: '/simulate/finance' },
      { id: 'finance-quiz', title: 'Finance Quiz', type: 'quiz', description: 'Test financial literacy', icon: '📝', path: '/quiz/finance' },
    ]
  },
  {
    id: 'law',
    name: 'Law',
    icon: '⚖️',
    color: '#a78bfa',
    gradient: 'from-violet-400 to-purple-600',
    description: 'Understand legal principles through case studies and scenarios',
    topics: ['Constitutional Law', 'Criminal Law', 'Civil Law', 'Contract Law', 'International Law', 'Ethics'],
    modules: [
      { id: 'case-study', title: 'Case Studies', type: 'activity', description: 'Analyze real legal cases', icon: '📖', path: '/workspace/law' },
      { id: 'law-quiz', title: 'Law Quiz', type: 'quiz', description: 'Test legal knowledge', icon: '📝', path: '/quiz/law' },
    ]
  },
  {
    id: 'agriculture',
    name: 'Agriculture',
    icon: '🌾',
    color: '#84cc16',
    gradient: 'from-lime-500 to-green-600',
    description: 'Learn sustainable farming through interactive crop simulations',
    topics: ['Crop Science', 'Soil Science', 'Irrigation', 'Pest Control', 'Sustainable Farming', 'Genetics'],
    modules: [
      { id: 'crop-sim', title: 'Crop Simulator', type: 'simulation', description: 'Simulate crop growth conditions', icon: '🌱', path: '/simulate/climate' },
      { id: 'agri-quiz', title: 'Agriculture Quiz', type: 'quiz', description: 'Test farming knowledge', icon: '📝', path: '/quiz/agriculture' },
    ]
  },
  {
    id: 'environment',
    name: 'Environmental Science',
    icon: '🌍',
    color: '#14b8a6',
    gradient: 'from-teal-500 to-cyan-600',
    description: 'Understand climate and ecosystems through dynamic simulations',
    topics: ['Climate Change', 'Ecosystems', 'Biodiversity', 'Pollution', 'Renewable Energy', 'Conservation'],
    modules: [
      { id: 'climate-sim', title: 'Climate Simulator', type: 'simulation', description: 'Model climate change scenarios', icon: '🌡️', path: '/simulate/climate' },
      { id: 'ecosystem-sim', title: 'Ecosystem Explorer', type: 'visualization', description: 'Interactive ecosystem model', icon: '🌿', path: '/workspace/environment' },
    ]
  },
];

export const getSubject = (id: string) => SUBJECTS.find(s => s.id === id);
export const getSubjectByName = (name: string) => SUBJECTS.find(s => s.name.toLowerCase() === name.toLowerCase());

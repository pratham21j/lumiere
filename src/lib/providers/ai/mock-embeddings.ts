import { EMBEDDING_DIM } from "./types";

/**
 * Deterministic text embeddings for the mock AI provider.
 *
 * Tokens are hashed into a fixed vector space (feature hashing) after a
 * synonym expansion pass, so related vocabulary ("space", "cosmos",
 * "astronaut") lands near each other. Not a real semantic model — but
 * deterministic, dependency-free, and good enough that "slow psychological
 * thriller" genuinely ranks the right films first. Swapping AI_PROVIDER to
 * openai replaces this wholesale.
 */

/** Small hand-built thesaurus: query words -> catalog vocabulary. */
const SYNONYMS: Record<string, string[]> = {
  space: ["space", "astronaut", "cosmos", "wormhole", "mars", "black-hole", "starship"],
  cosmos: ["space"],
  astronaut: ["space", "survival"],
  scifi: ["science", "fiction", "space", "ai", "dystopia"],
  "sci-fi": ["science", "fiction", "space", "ai", "dystopia"],
  mindbending: ["mind-bending", "twist", "puzzle", "nonlinear", "surreal"],
  "mind-bending": ["twist", "puzzle", "nonlinear", "surreal", "philosophical"],
  trippy: ["mind-bending", "surreal", "dreams"],
  cerebral: ["philosophical", "mind-bending", "slow-burn"],
  psychological: ["psychological", "unsettling", "paranoia", "madness", "unreliable-narrator"],
  slow: ["slow-burn", "atmospheric"],
  thriller: ["thriller", "tension", "suspense", "cat-and-mouse"],
  sad: ["melancholy", "tearjerker", "bittersweet", "grief", "tragedy"],
  cry: ["tearjerker", "emotional", "grief"],
  tearjerker: ["emotional", "sad-romance", "grief"],
  romance: ["romance", "love", "romantic", "sad-romance", "longing"],
  romantic: ["romance", "love"],
  love: ["romance", "romantic", "tender"],
  funny: ["funny", "comedy", "dark-comedy", "quirky", "satire"],
  comedy: ["funny", "quirky", "charming"],
  hilarious: ["funny", "comedy"],
  emotional: ["emotional", "tearjerker", "funny-but-emotional", "tender", "bittersweet"],
  happy: ["feel-good", "wholesome", "charming", "optimistic", "crowd-pleaser"],
  "feel-good": ["wholesome", "charming", "optimistic", "feel-good"],
  uplifting: ["feel-good", "hope", "optimistic", "underdog"],
  relaxing: ["feel-good", "charming", "wholesome", "cozy-mystery", "gentle"],
  chill: ["feel-good", "charming", "relaxing"],
  family: ["family", "wholesome", "feel-good", "friendship"],
  kids: ["family", "wholesome"],
  anime: ["anime", "ghibli", "world-building"],
  animation: ["anime", "family", "visually-stunning"],
  worldbuilding: ["world-building", "epic", "wonder"],
  "world-building": ["epic", "wonder", "fantasy"],
  time: ["time-travel", "time-dilation", "nonlinear", "time"],
  timetravel: ["time-travel", "paradox", "nonlinear"],
  "time-travel": ["paradox", "nonlinear", "fate"],
  villain: ["villain", "villain-wins", "dark", "morally-complex"],
  wins: ["villain-wins"],
  horror: ["horror", "dread", "unsettling", "disturbing", "monsters", "ghosts"],
  scary: ["horror", "dread", "unsettling"],
  creepy: ["unsettling", "dread", "horror"],
  heist: ["heist", "crime", "betrayal"],
  crime: ["crime", "mafia", "gangs", "detective"],
  detective: ["whodunit", "mystery", "detective"],
  mystery: ["mystery", "whodunit", "puzzle", "twist"],
  twist: ["twist", "unreliable-narrator", "mind-bending"],
  epic: ["epic", "world-building", "spectacle"],
  war: ["war", "history", "harrowing"],
  underrated: ["underrated", "low-budget", "cult-classic"],
  gems: ["underrated"],
  hidden: ["underrated"],
  classic: ["classic", "iconic"],
  oscar: ["oscar-winner", "classic"],
  music: ["music", "jazz", "musical"],
  musical: ["music", "musical"],
  revenge: ["revenge", "tragedy"],
  dystopia: ["dystopia", "cyberpunk", "ai"],
  ai: ["ai", "consciousness", "simulation"],
  robot: ["robot", "ai"],
  dreams: ["dreams", "subconscious", "surreal"],
  grief: ["grief", "melancholy", "healing", "loss"],
  dark: ["dark", "bleak", "villain-wins"],
  bleak: ["dark", "villain-wins", "tragedy"],
  atmospheric: ["atmospheric", "slow-burn", "visually-stunning"],
  beautiful: ["visually-stunning", "atmospheric", "wonder"],
  action: ["action", "energetic", "spectacle"],
  superhero: ["superhero", "multiverse", "action"],
};

const STOPWORDS = new Set([
  "a", "an", "the", "and", "or", "but", "with", "for", "of", "to", "in", "on",
  "i", "me", "my", "we", "want", "like", "movie", "movies", "film", "films",
  "watch", "watching", "something", "some", "that", "this", "is", "are", "it",
  "recommend", "suggest", "please", "show", "about", "where", "when", "really",
  "very", "good", "great", "best", "amazing",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/** FNV-1a — stable, fast string hash. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Embed text deterministically. Each token contributes to 3 hashed
 * dimensions (reduces collisions); expanded synonyms contribute at
 * lower weight, so a query shares mass with related catalog vocabulary.
 */
export function mockEmbed(text: string): number[] {
  const vec = new Float64Array(EMBEDDING_DIM);
  const tokens = tokenize(text);

  const add = (term: string, weight: number) => {
    for (let k = 0; k < 3; k++) {
      const h = fnv1a(`${term}#${k}`);
      const idx = h % EMBEDDING_DIM;
      const sign = (h & 1) === 0 ? 1 : -1;
      vec[idx] += sign * weight;
    }
  };

  for (const token of tokens) {
    add(token, 1);
    for (const syn of SYNONYMS[token] ?? []) add(syn, 0.6);
  }

  // L2 normalize so cosine distance behaves.
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIM; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm) || 1;
  return Array.from(vec, (v) => v / norm);
}

/** Canonical embedding document for a movie — shared by seed + search. */
export function movieEmbeddingText(m: {
  title: string;
  overview: string;
  keywords: string[];
  genres: { name: string }[];
}): string {
  // Keywords repeated to dominate the vector; that's where the "vibe" lives.
  const kw = m.keywords.join(" ");
  const genres = m.genres.map((g) => g.name).join(" ");
  return `${kw} ${kw} ${genres} ${m.title} ${m.overview}`;
}

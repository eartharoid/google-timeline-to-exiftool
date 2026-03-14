import { readFile } from 'node:fs/promises';

const input = process.argv[2] || './Timeline.json';
console.log('Reading', input);
const timeline = JSON.parse(await readFile(input, 'utf-8'));

/**
 * Searches for specific keys and returns their full paths (excluding array indices).
 * * written by Gemini
 * 
 * @param {any} data - The input array or object.
 * @param {string[]} targets - Array of keys to look for.
 * @returns {Set<string>}
 */
function findDeepPaths(data, targets = ["LatLng", "latLng", "point"]) {
  const paths = new Set();
  const targetSet = new Set(targets);

  function recurse(current, currentPath) {
    // 1. Handle Arrays: add "[]" to path and recurse into elements
    if (Array.isArray(current)) {
      current.forEach(item => recurse(item, `${currentPath}[]`));
    } 
    // 2. Handle Objects: check keys and recurse
    else if (typeof current === 'object' && current !== null) {
      for (const key in current) {
        // Construct the path for the current key
        const newPath = currentPath ? `${currentPath}.${key}` : key;

        // If this key matches one of our targets, add the full path to the Set
        if (targetSet.has(key)) {
          paths.add(newPath);
        }

        // Always recurse into the value to find deeper nested targets
        recurse(current[key], newPath);
      }
    }
  }

  // Handle the top-level input (usually an array)
  if (Array.isArray(data)) {
    data.forEach(obj => recurse(obj, ""));
  } else {
    recurse(data, "");
  }

  return paths;
}

console.log([...findDeepPaths(timeline)]);
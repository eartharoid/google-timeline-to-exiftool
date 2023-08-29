#!/usr/bin/env node

import { program } from 'commander';
import {
	readFile,
	writeFile,
} from 'node:fs/promises';
import ProgressBar from 'progress';

const pkg = JSON.parse(await readFile('package.json', 'utf-8'));
program
	.version(pkg.version)
	.requiredOption('-i, --input <file>', 'path to input file')
	.parse(process.argv);
const opts = program.opts();
let csv = 'GPSAltitude,GPSDateTime,GPSLatitude,GPSLongitude,GPSSpeed (m/s),GPSTrack';
console.log('Reading', opts.input, '...');
const { locations } = JSON.parse(await readFile(opts.input, 'utf-8'));
console.log('Processing ...');
const bar = new ProgressBar(':percent - :current/:total | :bar', {
	total: locations.length,
	width: 50,
});

for (const location of locations) {
	const row = {
		'GPSAltitude': location.altitude ?? '',
		'GPSDateTime': location.timestamp.replace(/-/g, ':').replace('T', ' '),
		'GPSLatitude': location.latitudeE7 / 1e7,
		'GPSLongitude': location.longitudeE7 / 1e7,
		'GPSSpeed (m/s)': location.velocity ?? '',
		'GPSTrack': location.heading ?? '',
	};
	csv += '\n' + Object.values(row).join(',');
	bar.tick();
}

console.log('Writing history.csv ...');
await writeFile('./history.csv', csv);
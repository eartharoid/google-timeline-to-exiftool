#!/usr/bin/env node

import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';

const now = new Date();
const filename = `locations-up-to-${now.toISOString().slice(0, 10)}.csv`;
console.log(`Creating`, filename);
const stream = createWriteStream(filename);
// ? https://www.exiftool.org/geotag.html#CSVFormat
stream.write('GPSAltitude,GPSDateTime,GPSLatitude,GPSLongitude,GPSSpeed (m/s)');

const input = process.argv[2] || './Timeline.json';
console.log('Reading', input);
const timeline = JSON.parse(await readFile(input, 'utf-8'));

let t = timeline.rawSignals.length;
let i = 0;

for (const signal of timeline.rawSignals) {
	const { position } = signal;
	if (position && position.LatLng) {
		const [lat, lng] = position.LatLng.replace(/°/g, '').split(', ');
		stream.write(
			'\n'
			+ (position.altitudeMeters ?? '') + ','
			+ position.timestamp.replace(/-/g, ':').replace('T', ' ') + ','
			+ lat + ','
			+ lng + ','
			+ (position.speedMetersPerSecond ?? '')
		);
	}
	i++;
	process.stdout.write(`\rProcessing - ${i}/${t} (${((i / t) * 100).toFixed(2)}%)`);
}

stream.end();
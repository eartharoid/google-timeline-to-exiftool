#!/usr/bin/env node

import { createWriteStream } from 'node:fs';
import { readFile } from 'node:fs/promises';

const now = new Date();
const filename = `positions-up-to-${now.toISOString().slice(0, 10)}.csv`;
console.log(`Creating`, filename);
const stream = createWriteStream(filename);
// ? https://www.exiftool.org/geotag.html#CSVFormat
stream.write('GPSDateTime,GPSLatitude,GPSLongitude,GPSAltitude,GPSSpeed (m/s)');

const input = process.argv[2] || './Timeline.json';
console.log('Reading', input);
const timeline = JSON.parse(await readFile(input, 'utf-8'));

function getTime(obj, raw = false) {
	const timestamp = obj.position?.timestamp
		|| obj.timelinePath?.[0]?.time
		|| obj.startTime;
	return raw ? timestamp : new Date(timestamp).getTime();
}

function fmtTime(str) {
	return str.replace(/-/g, ':').replace('T', ' ').replace(/\.\d+/, '');

}

function getLatLng(str) {
	return str.replace(/°/g, '').split(', ');
}

function extract(obj) {
	if (obj.timelinePath) {
		for (const path of obj.timelinePath) {
			if (path.time && path.latLng) {
				const [lat, lng] = getLatLng(path.point);
				stream.write(
					'\n'
					+ fmtTime(path.time) + ','
					+ lat + ','
					+ lng + ','
					+ ',' // no altitude
					// no speed
				);
			}
		}
	}
	if (obj.visit?.topCandidate?.placeLocation?.latLng) {
		if (obj.visit.probability >= 0.50 && obj.visit.topCandidate.probability >= 0.25) {
			const [lat, lng] = getLatLng(obj.visit.topCandidate.placeLocation.latLng);
			stream.write(
				'\n'
				+ fmtTime(obj.startTime) + ','
				+ lat + ','
				+ lng + ','
				+ ',' // no altitude
				// no speed
				+ '\n'
				+ fmtTime(obj.endTime) + ','
				+ lat + ','
				+ lng + ','
				+ ',' // no altitude
				// no speed
			);
		}

	}
	if (obj.activity?.start?.latLng) {
		const [lat, lng] = getLatLng(obj.activity.start.latLng);
		stream.write(
			'\n'
			+ fmtTime(obj.startTime) + ','
			+ lat + ','
			+ lng + ','
			+ ',' // no altitude
			// no speed
		);

	}
	if (obj.activity?.end?.latLng) {
		const [lat, lng] = getLatLng(obj.activity.end.latLng);
		stream.write(
			'\n'
			+ fmtTime(obj.endTime) + ','
			+ lat + ','
			+ lng + ','
			+ ',' // no altitude
			// no speed
		);
	}
	if (obj.activity?.parking?.location?.latLng) {
		const [lat, lng] = getLatLng(obj.activity.parking.location.latLng);
		stream.write(
			'\n'
			+ fmtTime(obj.activity.parking.startTime) + ','
			+ lat + ','
			+ lng + ','
			+ ',' // no altitude
			// no speed
		);
	}
	if (obj.position?.LatLng) { // ! note different capitalisation
		const [lat, lng] = getLatLng(obj.position.LatLng);
		stream.write(
			'\n'
			+ fmtTime(obj.position.timestamp) + ','
			+ lat + ','
			+ lng + ','
			+ (obj.position.altitudeMeters ?? '') + ','
			+ (obj.position.speedMetersPerSecond ?? '')
		);
	}
}

const ss = timeline.semanticSegments ?? [];
const rs = timeline.rawSignals ?? [];
let t = ss.length + rs.length;
let ssi = 0;
let rsi = 0;

while (ssi < ss.length || rsi < rs.length) {
	const seg = ss[ssi];
	const sig = rs[rsi];
	if (ssi < ss.length && !getTime(seg, true)) {
        ssi++; 
        continue;
    }
    if (rsi < rs.length && !getTime(sig, true)) {
        rsi++; 
        continue;
    }
	let row;
	if (ssi < ss.length && (rsi >= rs.length || getTime(seg) <= getTime(sig))) {
		row = extract(seg);
		ssi++;
	} else {
		row = extract(sig);
		rsi++;
	}
	process.stdout.write(`\rProcessing - ${ssi + rsi}/${t} (${(((ssi + rsi) / t) * 100).toFixed(2)}%)`);
}

stream.end();
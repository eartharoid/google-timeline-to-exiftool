# google-timeline-to-exiftool

A tiny, fast, zero-dependency script to convert your Google Maps Timeline location data to an [ExifTool](https://www.exiftool.org/geotag.html)-compatible CSV format of timestamps and GPS coordinates.

Read more at <https://eartharoid.me/blog/using-google-timeline-for-my-photos/>.

## Usage

Requires a [Node.js](https://nodejs.org/en/download)-compatible runtime.

```
node . Timeline.json
```

## Extracted data

> [!NOTE]
> **Updated:** March 2026
>
> Google changes their output annoyingly often.
> Please open an issue if the script is not compatible with the current export format.

- `semanticSegments[].timelinePath[].point`
  - `./time`
- `semanticSegments[].visit.topCandidate.placeLocation.latLng`
  - `(if ../../probability > 0.5)`
  - `(and ../probability > 0.25)`
  - `../../../startTime`
  - `../../../endTime`
- `semanticSegments[].activity.start.latLng`
  - `../../startTime`
- `semanticSegments[].activity.end.latLng`
  - `../../endTime`
- `semanticSegments[].activity.parking.location.latLng`
  - `../startTime`
- `rawSignals[].position.LatLng`
  - `./timestamp`
  - ~~`./accuracyMeters?`~~ (not supported as CSV column)
  - `./altitudeMeters?`
  - `./speedMetersPerSecond?`

### Example

This script outputs a CSV file:

```csv
GPSDateTime,GPSLatitude,GPSLongitude,GPSAltitude,GPSSpeed (m/s)
2026:02:09 16:04:53+00:00,52.6972529,-1.6781693,107.19999,1.059999
```

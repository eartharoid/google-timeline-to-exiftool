# google-timeline-to-exiftool
A script to convert your Google Timeline data (exported from Google Takeout) to an ExifTool-compatible format.

```
exiftool.exe -geotag history.csv -geosync=-18:47 Photos
```
# nico-ongaku
A module to bulk fetch videos from niconico and extract audios. Support fetching/extract video from ranking board and mylist

Installation
==========

**Install ffmpeg**

```
$ brew install ffmpeg
```

And then

```
npm install nico-ongaku -g
```

Usage
=========

**Download video and Extract music by video ID (currently support IDs starting with sm / nm)**

```
nico extract sm1234567 [sm2345678 sm3456789 ...] -u YOUR_EMAIL -p YOUR_PASSWORD -o /Users/YOUR_NAME/Music
```

**Download video and Extract music on Ranking board**

```
nico rank weekly  -u YOUR_EMAIL -p YOUR_PASSWORD -o /Users/YOUR_NAME/Music
```

Options:
  * weekly
  * daily
  * monthly
  * utami

**Download video and Extract music in Mylist**

```
nico mylist [MYLIST ID]  -u YOUR_EMAIL -p YOUR_PASSWORD -o /Users/YOUR_NAME/Music
```

Other Options
------------

```
  -f, --fileName <String>  Name for final zipped file

  -l, --limit <Number>     Limit number of video to download
```

*Doesn't work on Windows*
*水表已拆，不收快递*
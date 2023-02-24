## Add spine files into this folder

For example, let's assume your animation project is called `Big_head`. Then, Spine should export at least three files

- Big_head.altas
- Big_head.png
- Big_head.skel

or

- Big_head.altas
- Big_head.png
- Big_head.json

Put all these three files here, in the same level as this README file, no extra folders

## Create a config.json file in this folder

### Template

```
{
  "width": <number>, // the width of the canvas
  "height": <number>, // the height of the canvas
  "meshes": [ // this is an array. you may have more than one animations, e.g. one is for background, another one is for your charactor
    {
      "type": "spine", // use "spine" for spine animation
      "skeletonFileName": <string>, // your skeleton file name in binary, the extension name should be ".skel"
      "jsonFileName": <string>, // your skeleton file name in json, the extension name should be ".json"
      "atlasFileName": <string>, // your atlas file name, the extension name should be ".atlas"
      "animationName": <string>, // the animation name you want to play
      "scale": <number>, // the size of your animation, usually should be 1
      "position": { // the position of your animation in canvas
        "x": <number>,
        "y": <number>,
        "z": <a negative number> // Note: the camera is on (0,0,0), so z should be a nagative value
      },
      "cursorFollow": { // if there is a cursor follow feature in this animation, otherwise you can remove this section
        "animationName": <string>, // the animation name that plays cursor follow animation
        "boneName": <string>, // when cursor is moving, a bone should follow the cursor position. put the bone name here.
        "maxFollowDistance": <number> // sometimes we don't to limit the movement distance (or range) of the bone, put the number here.
      },
      "cursorPress": { // if there is a cursor press feature in this animation, otherwise you can remove this section
        "animationName": <string>, // the animation name that plays cursor press animation
        "boneName": <string>, // when cursor is pressed and moving, a bone should follow the cursor position. put the bone name here.
        "maxFollowDistance": <number> // sometimes we don't to limit the movement distance (or range) of the bone, put the number here.
      }
    }
  ]
}
```

Note:

- you only need to provide either `skeletonFileName` or `jsonFileName`. If `skeletonFileName` is given, then `jsonFileName` can be empty, and vice versa.

#### Example:

Let's assume your animation project is called `Big_head`, and this animation also contains `Road_background` project as a background animation.
The user can also use cursor to control the direction of `Big_head`, and the bone name is `Move_Head`

In this case, your config maybe like:

```
{
  "width": 2048,
  "height": 2048,
  "meshes": [
    {
      "type": "spine",
      "skeletonFileName": "Road_background.skel",
      "atlasFileName": "Road_background.atlas",
      "animationName": "Idle_Default",
      "scale": 1,
      "position": {
        "x": 0,
        "y": 0,
        "z": -1200
      }
    },
    {
      "type": "spine",
      "skeletonFileName": "Big_head.skel",
      "atlasFileName": "Big_head.atlas",
      "animationName": "Idle_Default",
      "scale": 1,
      "position": {
        "x": 0,
        "y": 0,
        "z": -1000
      },
      "cursorFollow": {
        "animationName": "Animation_123",
        "boneName": "Move_Head",
        "maxFollowDistance": 100
      }
    },
  ]
}

```

## Animated Texture Type

The `meshes` array can also contain other type of animations or static images

### Template

```
{
  "type": "texture", // for static image or animated texture, use "texture"
  "scale": <number>, // the size of your texture, usually should be 1
  "position": { // the position of your animation in canvas
    "x": <number>,
    "y": <number>,
    "z": <a negative number> // Note: the camera is on (0,0,0), so z should be a nagative value
  },
  "width": <number>, // texture display width
  "height": <number>, // texture display height
  "textureFileName": <string>, // texture file name
  "tilesHorizontal": <number>, // number of tiles horizontally
  "tilesVertical": <number>, // number of tiles vertically
  "numTiles": <number>, // total number of tiles
  "tileDisplayDuration": <number> // how long should each tile be displayed
}
```

Note: If want to display a static image, then set `tileDisplayDuration` to 0.

## Video Type

The `meshes` array can also play videos

### Template

```
{
  "type": "video", // for video type, use "video"
  "scale": <number>, // the size of your video, usually should be 1
  "position": { // the position of your video in canvas
    "x": <number>,
    "y": <number>,
    "z": <a negative number> // Note: the camera is on (0,0,0), so z should be a nagative value
  },
  "width": <number>, // video display width
  "height": <number>, // video display height
  "videoFileName": <string>, // video file name
}
```

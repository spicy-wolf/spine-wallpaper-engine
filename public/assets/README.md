## Add spine files into this folder

For example, let's assume your animation project is called `Big_head`. Then, Spine should export at least three files

- Big_head.altas
- Big_head.png
- Big_head.skel

Put all these three files here, in the same level as this README file, no extra folders

## Create a config.json file in this folder

### Template

```
{
  "width": <number>, // the width of the canvas
  "height": <number>, // the height of the canvas
  "meshes": [ // this is an array. you may have more than one animations, e.g. one is for background, another one is for your charactor
    {
      "skeletonFileName": <string>, // your skeleton file name, the extension name should be ".skel",
      "atlasFileName": <string>, // your atlas file name, the extension name should be ".atlas",
      "animationName": <string>, // the animation name you want to play
      "scale": <number>, // the size of your animation, usually should be 1
      "position": { // the position of your animation in canvas
        "x": <number>,
        "y": <number>,
        "z": <a negative number> // Note: the camera is on (0,0,0), so z should be a nagative value
      },
      "cursorFollow": { // if there is a cursor follow feature in this animation, otherwise you can remove this section
        "animationName": <string>, // the animation name that plays cursor follow animation
        "boneName": <string>, // when cursor moves, a bone should follow the cursor position. put the bone name here.
        "maxFollowDistance": <number> // sometimes we don't to limit the movement distance (or range) of the bone, put the number here.
      }
    }
  ]
}
```

### Example:

Let's assume your animation project is called `Big_head`, and this animation also contains `Road_background` project as a background animation.
The user can also use cursor to control the direction of `Big_head`, and the bone name is `Move_Head`

In this case, your config maybe like:

```
{
  "width": 2048,
  "height": 2048,
  "meshes": [
    {
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

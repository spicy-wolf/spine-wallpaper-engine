## 把 spine 项目文件放进这个文件夹

举例来说，假设你的动画项目叫做`Big_head`. 那么，Spine 引擎会导出至少三个项目。

- Big_head.altas
- Big_head.png
- Big_head.skel

把这三个文件放进这个文件夹里，和这个 README 文件在同一个等级，不需要创建额外的文件夹。

## 在这个文件夹里创建一个 config.json

### 模板

```
{
  "width": <number>, // 画布的宽度
  "height": <number>, // 画布的高度
  "meshes": [ // 这是一个数组类型。当你需要多个动画叠加。比如说，一个是背景，一个是人物
    {
      "skeletonFileName": <string>, // 骨骼文件名称，扩展名是".skel",
      "atlasFileName": <string>, // 皮肤配置文件名称，扩展名是".atlas",
      "animationName": <string>, // 动画名称
      "scale": <number>, // 动画的大小，通常来说值是 1
      "position": { // 画布的位置
        "x": <number>,
        "y": <number>,
        "z": <a negative number> // 注意：镜头的位置在 (0,0,0), 所以z轴的坐标应该是复数
      },
      "cursorFollow": { // 如果没有光标跟踪动画，那么可以移除这部分
        "animationName": <string>, // 光标跟踪动画名称
        "boneName": <string>, // 当光标移动的时候，骨骼会和光标一起移动。把骨骼名称放这里
        "maxFollowDistance": <number> // 光标跟踪最大距离
      },
      "cursorPress": {// 如果没有按住光标跟踪动画，那么可以移除这部分
        "animationName": <string>, // 按住光标跟踪动画名称
        "boneName": <string>, // 如果光标按住了并且移动，那么骨骼会和光标一起移动。把骨骼名称放这里
        "maxFollowDistance": <number> // 光标跟踪最大距离
      }
    }
  ]
}
```

### 例子:

我们假设你的动画项目叫做`Big_head`。并且，这个动画包含了`Road_background`项目作为背景动画。
同时，用户也可以用光标来控制`Big_head`的方向，骨骼的名称是`Move_Head`。

那么，你的配置文件大概会是这个样子:

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

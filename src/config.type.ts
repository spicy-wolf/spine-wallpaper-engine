/**
 * @license
 * Spine Wallpaper Engine. This is a Spine animation player for wallpaper engine.
 * Copyright (C) 2023 Spicy Wolf
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

export type Configs = { width: number; height: number; meshes: Array<Config> };

export type ActionAnimation = {
  animationName: string;
  boneName: string;
  maxFollowDistance: number;
};

type Config = {
  skeletonFileName: string;
  jsonFileName: string;
  atlasFileName: string;
  animationName: string;
  scale: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  cursorFollow?: ActionAnimation;
  cursorPress?: ActionAnimation;
};

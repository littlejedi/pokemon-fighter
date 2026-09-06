# 贴图素材与来源

所有运行素材保存在本目录，游戏不会运行时从第三方站点热链图片。

## 训练家

`trainers/0.png` 至 `14.png` 为待机立绘，`*_2.png` 为动作立绘。来源为 Pokémon Masters EX 角色渲染，由 [Trainer Cards Studio](https://github.com/jonbarrow/trainercards.studio/tree/master/public/images/trainers/masters) 素材库整理。29 张为 1024×1024，阿渡第二姿态为 800×800。

顺序：小智、小刚、小霞、马志士、莉佳、阿桔、娜姿、夏伯、坂木、科拿、希巴、菊子、阿渡、青绿、大木博士。坂木与青绿使用 classic 版本，小智使用 Masters 中的动画版造型。

## 宝可梦

`pokemon/` 使用 [PokeAPI sprites](https://github.com/PokeAPI/sprites/tree/master/sprites/pokemon/other/official-artwork) 整理的官方原画。它们是高清透明原画，不是程序简笔画。用户提供的 [Pokémon Database sprites](https://pokemondb.net/sprites) 用作原作形象参考。

角色和宝可梦相关权利归 Pokémon / Nintendo / Creatures / GAME FREAK 及相关权利方所有；本项目不主张拥有这些素材。项目同人性质不改变原素材权利归属。

## 场景

`stages/viridian.png`、`cerulean.png`、`indigo.png` 是用内置 image_gen 生成的独立场景贴图，以常青道馆、华蓝道馆和石英高原为题材，采用清晰的卡通游戏环境风格。这些背景并非官方游戏截图或原版地图的逐块复刻。

完整生成提示词保存在 [stage-prompts.json](meta/stage-prompts.json)。用户提供的 Pinterest 道馆集合及 DeviantArt 训练家集合页面未能通过网页工具直接读取，因此没有复制这两个页面的图片。

## 元数据

- `meta/sources.json`：每一张外部素材的原始下载地址。
- `meta/bounds.json`：透明通道的内容边界；用于显示裁切与脚底对齐，原始图片没有重绘或低清放大。
- `meta/stage-prompts.json`：背景提示词与所用生成工具。

战斗渲染使用高分辨率 Canvas、平滑采样、两种人物姿态及位移/旋转过渡；并非多帧骨骼动画或完整动作捕捉。

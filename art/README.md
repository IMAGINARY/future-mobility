# Exporting car textures

## 2025 instructions

[TexturePacker](https://www.codeandweb.com/texturepacker) is now used to shrink the textures and create a sprite sheet (JSON + PNG).

- In Illustrator: Export car textures to PNG in 16x resolution using the "Assets Export" window.
  - Export to: art/sprites/cars/
  - Scale: 16x
  - Suffix: <none>
  - Format: PNG
  - PNG settings:
    - Art Optimized (Supersampling)
    - Interlaced: No
    - Background color: Transparent
  - Prefix: <none>
- Open art/sprites/cars.tps with TexturePacker
  - "Publish Sprite Sheet"

## 2021 instructions

Resizing car textures using Photoshop resulted in better results than using Adobe Illustrator.

The procedure used was:
- In Illustrator: Export car textures to PNG in 16x resolution using the "Assets Export" window
- In Photoshop: Resize the images to 6.25% size using the Automate > Batch... command
  - Options are:
    - Play
      - Set: Futurium
      - Action: Shrink Cars
    - Source: Folder (select the folder where the saved PNGs are)
    - Destination: Folder (select the destination folder)
      - File naming: 
        - Document name
        - Extension

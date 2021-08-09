# Cars architecture

Code in this directory is related to showing cars on the roads of a MapView.

## Main concepts

The most important concept is that this whole layer is simply "eye candy". Its goal is to show
a reasonable and fun depiction of cars moving through the city, but it doesn't produce any ouput 
that could be fed into the city simulation. To do so would require a much more complex model of
roads and connectivity. Think of it as an evolved version of the "marching ants" that represented
cars in the original Sim City game.

Cars move randomly through the city and follow a small number of basic rules. Cars are spawned and
move through road tiles. If a tile is removed or changes type the car will attempt to continue its
trajectory to the next one, so short disturbances to the map (e.g. camera malfunction) usually won't 
have effect over the cars.

## Classes

The main class is **CarOverlay**. It represents the optional visual overlay that is applied over a 
MapView to show animated cars on the roads. It tracks cars throughout their lifetime and acts as a 
coordinator for their interaction.

The **TrafficLights** class coordinates car's movement through intersections. It simulates very 
basic traffic lights.

The **CarSpawner** spawns randomly defined cars at random intervals on the CarOverlay.

The **Car** class represents a single car. It calculates its movement and modifies a PIXI.Sprite.

The CarOverlay and Cars track in which tile a car is. The car moves through a tile by following a
path, which can be defined by **PathStraight** or **PathArc**. These classes receive the distance
moved each frame and convert it to tile-relative coordinates. Cars are like trains and Paths define
their rails.

The **RoadMap** class provides helper methods which describe road connectivity in the City map.

The **RoadTile** class describes the geometry of the road tiles. e.g. How many different lanes there
are, the coordinates and cardinal directions of the points of entry and exit, the radius of the arcs
in curved tiles, etc.

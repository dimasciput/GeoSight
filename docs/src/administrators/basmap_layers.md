# Basemaps
<b>Basemaps</b> are ready-to-use maps that provide the foundation of the geographic visualization on GeoSight. These maps can come from a variety of different sources and are usually available at different scales, from a single region to the entire globe. Their main purpose is to provide the user with some base information about the area they are focusing on - e.g., terrain, main roads and railways, or satellite views -, so to allow for a better understanding of the context layers available on the platform.

## Basemaps for administrators
Administrators are able to adjust and delete existing basemaps and add new ones. This allows them to control the availability of basemaps.
### Accessing and adjusting basemaps
As with other administrative abilities, the Basemaps UI can be accessed from the GeoSight home page. To access the administative UI, click the user profile photo and select "Admin".

From here, select "Basemaps"

This will display the Admin UI for basemaps and allow you to see, as well as search for, all basemaps. In this tab, the basemaps are listed and sorted by their name, a breif description and a category to help administators understand their purpose.

On the far right, three horizontal dots, when selected, allow the administrator to delete a context layer. This will delete the layer for every project and remove it from GeoSight entirely.

Finally, on the bottom right the two arrows allow administators to view the multiple pages of context layers.

### Adding context layers

Basemaps can be added from the Basemaps Admin tab. On the top right you can find the button "Add Basemap".

This will bring you to the "Create Basemap Screen". Here, administrators can provide information required to connect the basemap to GeoSight, describe the basemap and attach security requirements for sensitive information.

Under name enter what you would like the user to call the basemap.

Although this is optional, you can provide a brief description of the context layer including identifying information or a citation. You can also select an icon of your choice as thumbnail.

Under 'URL", you will have to enter the originally URL of the basemap sourced from the website that hosts it.

Under "Type" you will indicate the type of basemap service, which can be WMS or WMTS (Tiled webmap). The type of service will be already known from the website the basemap is sourced from. WMS has the advantage of providing arbitrary and flexible boundaries, while WMTS has faster processing times.

Finally, under "Category" you will indicate the category the basemap belongs to (e.g. UN). 

Select the type of geospatial data the context layer is in.

If you wish to add security to the context layer you can either require a token or a standard username and password that the administator can provide to approved users.

To require a token

Administrators who would like to set a username and password can do so in the final two boxes.

Once all required boxes are complete and you have filled out the optional boxes of your choice click submit in the top right corner. In doing this, the basemap will be loaded to the visualization.

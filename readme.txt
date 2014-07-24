=== WP Store Locator ===
Contributors: tijmensmit
Tags: google maps, store locator, business locations, geocoding, stores, geo
Requires at least: 3.5
Tested up to: 3.9.1
Stable tag: 1.2.23
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl.html

An easy to use location management system that enables users to search for nearby physical stores.

== Description ==

WP Store Locator is a powerful and easy to use location management system. 
You can customize the appearance of the map and provide custom labels for entry fields. 
Users can filter the results by radius and see driving directions to the nearby stores in 
the language that is set in the admin panel. 

= Features include: =

* Manage an unlimited numbers of stores
* Set an unique thumbnail for each store
* Provide extra details for stores like the phone, fax, email, url, description and opening hours
* You can drag the marker to the exact spot on the 'Add Store' page
* Show the driving distances in either km or miles
* Choose from nine retina ready marker icons
* Show the store listings either underneath the map, or next to it
* Show Google Maps in different languages, this also influences the language for the driving directions
* Show the driving directions to the stores 
* Users can filter the returned results by radius or max results
* Supports the clustering of markers
* Customize the max results and search radius values that users can select
* Customize map settings like the terrain type, location of the map controls and the default zoom level
* Auto-locate the location of the user and show nearby stores
* Labels can be translated in any language through the settings panel

== Installation ==

1. Upload the `wp-store-locator` folder to the `/wp-content/plugins/` directory
1. Activate the plugin through the 'Plugins' menu in WordPress
1. Add your stores under 'Store Locator' -> Add Store
1. Add the map to a page with this shortcode: [wpsl]

== Frequently Asked Questions ==

= How do I add the store locator to a page? =

Add this shortcode [wpsl] to the page where you want to display the store locator.

= The map doesn't display properly. It's either broken in half or doesn't load at all. =

Make sure you have defined a start point for the map under settings -> Map Settings.

= I get an error saying the 'sensor' parameter specified in the request must be set to either 'true' or 'false' =

Make sure you don't have any security plugins, or custom functions running that strip away version numbers from file paths.

= Why does it show the location I searched for in the wrong country? =

Some location names exist in more then one country, and Google will guess which one you mean. This can be fixed by setting the correct 'Map Region' on the settings page -> API Settings.

= The store locator doesn't load, it only shows the number 1? =

This is most likely caused by your theme using ajax navigation ( the loading of content without reloading the page ), or a conflict with another plugin. Try to disable the ajax navigation in the theme settings, or deactivate the plugin that enables it to see if that solves the problem.

If you don't use ajax navigation, but do see the number 1 it's probably a conflict with another plugin. Try to disable the plugins one by one to see if one of them is causing a conflict.

If you find a plugin or theme that causes a conflict, please report it on the [support page](http://wordpress.org/support/plugin/wp-store-locator).


== Screenshots ==

1. Front-end of the plugin
2. The driving directions from the user location to the selected store
3. The 'Add Store' screen
4. The plugin settings
5. Overview from the current stores

== Changelog ==

= 1.2.23 =
* Fixed the geocoding request for the map preview on the add/edit page not including the zipcode when it's present, which can misplace the marker

= 1.2.22 =
* Fixed compatibility issues with the Google Maps field in the Advanced Custom Fields plugin
* Fixed the store urls in the store listings sometimes breaking
* Removed the requirement for a zipcode on the add/edit store page
* Improved the documentation in the js files

= 1.2.21 =
* Fixed an js error breaking the store locator

= 1.2.20 =
* Fixed the directions url sometimes showing an incomplete address due to an encoding issue
* Fixed the 'items' count on the store overview page showing the incorrect number after deleting a store
* Fixed the autocomplete for the 'start point' field sometimes not working on the settings page
* Fixed php notices breaking the store search when wp_debug is set to true
* Fixed the bulk actions when set to 'Bulk Actions' showing the full store list without paging
* Fixed small css alignment issues in the admin area
* Fixed the js script still trying to load store data when autoload was disabled
* Fixed the clickable area around the marker being to big
* Improved: After a user clicks on 'directions' and then clicks 'back', the map view is returned to the original location
* Removed: the 'Preview location on the map' button no longer updates the zip code value it receives from the Google Maps API
* Changed the way the dropdown filters are handled on mobile devices. They are now styled and behave according to the default UI of the device
* Added support for WP Multisite
* Added 'Screen Options' for the 'Current Stores' page, so you can define the amount of stores that are visible on a single page
* Added the option to make phone numbers clickable on mobile devices by adding a link around them with 'tel:'
* Added the option to make store names automatically clickable if the store url exists
* Added the option to show a 'zoom here' and 'street view' (when available) into the infowindow
* Added a second address field to the store fields
* Added the option to enable marker clusters
* Added the option to set a default country for the "Add Store" page
* Added Dutch (nl_NL) translations
* Added a .pot file to the languages folder for translators
* Added error handling for the driving directions
* Added several filters for developers: 
'wpsl_templates' for loading a custom template from another directory
'wpsl_menu_position' for adjusting the position of the store locator menu in the admin panel
'wpsl_capability' to manually set the required user capability for adding/editing stores
'wpsl_gmap_api_attributes' to modify the Google maps parameters ( change the map language dynamically )

= 1.2.13 =
* Fixed the store search not returning any results when the limit results dropdown is hidden

= 1.2.12 =
* Added an option to choose where the 'More info' details is shown, either in the store listings or on the map
* Added the 'back' and 'reset' text to the label fields on the settings page
* Added the option to remove the scrollbar when the store listings are shown below the map
* Improved the position of the reset button when the map controls are right aligned
* Fixed the 'More info' translation not working
* Fixed the start position marker disappearing when dragged

= 1.2.11 =
* Fixed the distance format always using km when you click the 'directions' text in the marker
* Fixed an issue where a CSS rule in some themes would place a background image on the active item in the dropdown list
* Added an option to disable the mouse cursor on pageload focusing on the location input field 
* Added an option to add a 'More info' link to the store listings, which when clicked will open the info window in the marker on the map

= 1.2.1 =
* Added an option to show the store listings below the map instead of next to it
* Added an option to open the directions in a new window on maps.google.com itself
* Fixed a 'too much recursion' js error that showed up when no start location was defined
* Fixed the auto loading of stores not being ordered by distance
* Fixed a problem with the input fields not always aligning in Chrome
* Improved the handling of thumbnails. If the thumbnail format is disabled in the theme, it will look for the medium or full format instead
* Several other small code improvements

= 1.1 =
* Added the option to open a link in a new window
* Added the option to show a reset button that will reset the map back to how it was on page load
* Added the option to load all stores on page load
* Fixed a problem with the shortcode output

= 1.0.1 =
* Fixed the styling for the store locator dropdowns being applied site wide
* Fixed a problem with slashes in store titles

= 1.0 =
* Initial release
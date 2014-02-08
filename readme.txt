=== WP Store Locator ===
Contributors: tijmensmit
Tags: google maps, store locator, business locations, geocoding, stores, geo
Requires at least: 3.5
Tested up to: 3.8.1
Stable tag: 1.2
License: GPLv3
License URI: http://www.gnu.org/licenses/gpl.html

An easy to use location management system that enables users to search for nearby physical stores

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

Make sure you have defined a start point for the map under settings -> map settings

= I get an error saying the 'sensor' parameter specified in the request must be set to either 'true' or 'false' =

Make sure you don't have any security plugins, or custom functions running that strip away version numbers from file paths.


== Screenshots ==

1. Front-end of the plugin
2. The driving directions from the user location to the selected store
3. The 'Add Store' screen
4. The plugin settings
5. Overview from the current stores

== Changelog ==

= 1.2 =
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
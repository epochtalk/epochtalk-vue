# DEVELOPMENT GUIDE

## Proxy Project

The proxy server queries the existing BCT database and manipulates that data to fit into Epochtalk's data models. The backend serves that manipulated data to the frontend project. This version of the project is for a read only mobile deployment of BCT.

### Continued Development

* Prequisites
  * SSH tunnel to BCT database from localhost if developing locally, this is required to make the proxy queries work
* Checkout each of the three projects and switch to the branch in parentheses
  * `epochtalk/epochtalk` (ui-refactor-2020)
    * There should be no modifications made to this project, it is just running to stop the frontend from breaking when hitting api routes which have not been ported to the new `epochtalk-server` yet
  * `epochtalk/epochtalk-vue` (proxy)
    * Changes can be made here when proxy BCT data doesn't quite fit into the current model design scheme of Epochtalk
  * `slickage/epochtalk-server` (main)
    * This should only be modified if there is an issue with existing proxied routes, or if there is a requirement to proxy more BCT data for the mobile read only site
    * Key Files
      * `lib/epochtalk_server/smf_query.ex` - used to proxy SMF data into Epochtalk format
      * `lib/epochtalk_server_web/controller/*.ex` - to override a standard route with data queried from the proxy, the controller must be modified. See existing examples of using the plug `:check_proxy` the `post.ex` controller is a good example of this.
      * `lib/epochtalk_server/bbc_parser.ex` - used to turn the bbcode parser into genserver process which can be deployed as a pool via `poolboy`
      * `parsing.php` - bbcode parser
      * `parsing_extra.php` - additional settings and functions required to run bbcode parser

## Main Project

The main project was initially written in Node/Angular an is in the process of being ported to Vue JS (Frontend) and Elixir (Backend).

### Continued Development

* Checkout each of the three projects and switch to the branch in parentheses
  * `epochtalk/epochtalk` (ui-refactor-2020)
    * There should be no modifications made to this project, it is just running to stop the frontend from breaking when hitting api routes which have not been ported to the new `epochtalk-server` yet.
  * `epochtalk/epochtalk-vue` (main)
    * Frontend changes should be made here. When new routes are ported to the new elixir server, the front end api/views must be updated as well.
    * See `PortRoadMap.md` within this project to view a list of remaining views to be ported.
  * `epochtalk/epochtalk-server` (main)
    * See `PortRoadmap.md` within the `epochtalk-server` project for a list of which models and features have been ported.

# Client documentation

Arkheia offers users a convenient way of organizing, exploring and publishing their neural simulation specifications and results via a dedicated web application.
In this section of the documentation we will explain to the user the web-based GUI frontend.
To find out how to install and deploy Arkheia please refer to the [Installation & Deployment](./install.html) section of the documentation.
The Arkheia follows the common client-server architecture. To learn how to communicate with the server, and extend Arkheia to be compatible with your
favorite simulation work-flow, please refer to the [API](/documentation/api) part of the documentation. Furthermore, if you want to learn more about the motivations behind
Arkheia design, or gain inspiration for various possible use-cases, read the [Arkheia manuscript](placeholder?). Should you use Arkheia in your scientific project
resulting in publication, please cite this paper.

## Landing page

When accessing an instance of Arkheia repository, user will first see the landing page depicted in figure 1. This page can be always accessed again
via the _About_ item of the top menu strip, or upon clicking the Arkheia logo on the left side of the top menu strip.

![About page](/assets/images/screenshots/about_annotated.png)
_Figure 1: About page._

The center of the landing page is occupied with the welcome message that can be customized by the user to tell visitors basic information
about the given repository instance (Fig 1.1), refer to [API](/documentation/api) on how to populate the message. The Arkheia [documentation](/documentation)
can be accessed via the _Documentation_ item in the top menu strip (Fig 1.4). Arkheia facilitates sharing of two types of simulation results:

1. Individual simulation runs can be accessed via the _Simulation runs_ item of the top menu strip (Fig 1.2).
2. Sets of simulation runs resulting from parameter searches can be accessed via the _Parameter searches_ item of the top menu strip (Fig 1.3).

## Documentation

The documentation page contains links to three parts of the Arkheia project documentation:

1. the documentation of the client web-based user interface (Fig 2.1) that you are currently viewing
2. the documentation of the [API](/documentation/api) specification (Fig 2.2) with which user can access the Arkheia database and thus use to integrate Arkheia with his favorite simulation tools
3. the installation & deployment guideline outlining several different use-cases for Arkheia usage accompanied by step-by-step instructions (Fig 2.3)

![Documentation page](/assets/images/screenshots/docs_annotated.png)
_Figure 2: Documentation page._

## Individual simulation runs page

The _simulation runs_ page offers a simple tabular representation of the set of simulation runs that were submitted to the repository, with each
row corresponding to single simulation run, and each column representing one simulation run property. The first four columns tell user (in this order)
when the given simulation run was submitted to the repository (Fig 3.1), when was the actual simulation executed (Fig 3.2), the name the user gave to
that specific simulation run (Fig 3.3) and the name of the model that was simulated (Fig 3.4). The next four columns contain links (the 'eye' icons)
that take the user to pages further exploring the content of the given simulation run. From left to right, user can explore the full parametrization
of the simulation (Fog 3.5), view all the stimuli that have been presented to the model (Fig 3.6), explore all the experimental protocols that have
been executed on the model during the simulation (Fig 3.7), and finally view the results that have been generated during the simulation (Fig 3.8).
Note that throughout the web-application you will encounter many similar tabular views, and in most cases the columns will be annotated with short
tool-tips briefly explaining what does the given column represent. In most of these tabular views, just like here in _simulation runs_, user will also be
able to sort the table based on a selected column by clicking on it's header name. Below the header name, user can also find an input window which allows
him to filter results based on entered string.

![Simulation runs page](/assets/images/screenshots/sim_run_annotated.png)
_Figure 3: Simulation runs page._

## The parameters page

Arkheia allows demonstration of the simulation's parametric configuration in the form of a tree structure. The parameter exploration page provides a classic tree-view graphical user interface with which user can conveniently explore this tree of parameters. The nodes marked with + sign can be expanded upon clicking the icon (Fig 4.1), the nodes marked
by the - sign can be collapsed (Fig 4.2). The leafs of the tree (marked by square icon) contain the value of the parameter defined by the path to the given leaf (Fig 4.3). The value is treated by Arkheia as an arbitrary string, thus Arkheia back-ends can convey extra information to the value of the parameters, such as their type, or as depicted in Fig 4.3 express
that the parameter is not a constant value but a distribution.

![Parameter view page](/assets/images/screenshots/param_view_annotated.png)
_Figure 4: Parameter view page._

## The stimulus view page

This page lets user to explore all stimuli that have been presented to the model during the simulation. It is organized in the same tabular manner
as the _Individual simulation runs_ page. The first column show the name of the stimulus (this should ideally correspond to the name of the code
(e.g. class or function)) that generates it (Fig 5.1). Second column contains a short description of the stimulus directly visible in the table (Fig 5.2), while
the third column contains longer description viewable upon clicking the corresponding 'eye' icon (Fig 5.3). The fourth column contains links that show upon clicking the list
of parameters and their values of the given stimulus in a pop-up panel (Fig 5.4). Finally, the fifth column contains small thumbnails of the actual stimulus that
was presented to the model (Fig 5.5).

![Stimulus view page](/assets/images/screenshots/stim_view_annotated.png)
_Figure 5: Stimulus view page._

Upon clicking the thumbnails, pop-up panel showing the full-sized stimulus movie appears (Fig 6).

![Stimulus parameters view page](/assets/images/screenshots/stim_param_view.png)
_Figure 6: Stimulus parameters view page._

## Experimental protocols page

This page is again organized in the now familiar tabular manner, this time listing experimental protocols that were conducted during the simulation (top of the page) and
the recording configurations describing what has been recorded and where during the simulation. For the experimental protocols 4 properties are listed, the reference to the
source code corresponding to the invocation of the given experimental protocols (Fig 7.1; this is typically a name of a class or a function), a short description of the protocol
(Fig 7.2), longer description that can be expanded and retracted upon selecting the 'eye' icon (Fig 7.3), and the parameter values that the specific protocol was invoked with
that show up as an pop-up upon selecting the corresponding 'eye' icon (Fig 7.4).

![Experimental protocols page](/assets/images/screenshots/exp_prot_view_annotated.png)
_Figure 7: Experimental protocols page._

The recording configurations section of the page is a bit more structured, listing 6 different properties, starting again with the reference to the
source code which is responsible for the given recording configuration (Fig 7.5), the name of the target population of neurons in which the
recording was performed (Fig 7.6), the list of signals that were recorded (e.g. spikes, membrane potential etc.) (Fig 7.7), short (Fig 7.8) and long (Fig 7.9) description of the
recording configuration, and the list of parameter values with which the recording configuration was invoked with (Fig 7.10), which appear as a pop-up upon clicking the
corresponding 'eye' icon (Fig 8).

![Experimental protocols page](/assets/images/screenshots/exp_prot_param_view.png)
_Figure 8: Experimental protocols page with parameters modal._

## Results page

The results page lets user browse figures that have been generated during the simulation. For each figure, the page lists the reference to the source code responsible for
generating the figure (Fig 9.1,this can be a class or function name for example), the name of the figure assigned by user (Fig 9.2), and finally the right-most column contains the
thumbnails of the figures.

![Results page](/assets/images/screenshots/results_view_annotated.png)
_Figure 9: Results page._

Upon clicking the thumbnails, the figure is displayed at full size (Fig 10). At the top of the full-size panel, user can navigate through the other figures generated during the simulation without leaving the full-size view:

![Results page full-screen](/assets/images/screenshots/results_view_fs.png)
_Figure 10: Results page - full-screen figure._

## Parameter search page

The parameter search page is very similar to the _Individual simulation runs page_, except that instead of listing individual simulations runs, it list sets of simulation runs
originating from a systematic parameter search. The first four columns thus tell user (in this order) when the given parameter search was submitted to the repository (Fig 11.1), when was the actual parameter search executed (Fig 11.2), the name the user gave to that specific parameter search (Fig 11.3) and the name of the model that was simulated (Fig 11.4).
The 'eye' icons in the fifth column take the user to a view which is identical to the _Individual simulation runs page_, but listing only simulation runs from the given
parameter search (Fig 11.5). Finally they 'eye' icons in the fifth column pass the user to an interactive view in which the user can explore the results
as a function of the parameter values that have been varied throughout the parameter search.

![Parameter search page](/assets/images/screenshots/parameter_search_annotated.png)
_Figure 11: Parameter search page._

## Parameter search inspect page

<a id="psip-anchor"></a>

This page allows users to interactively explore the results that originate in a series of simulations in which the parameters of the simulation were systematically varied. Currently
only grid-like searches of parameters are supported. Broadly, the page is dived into two horizontal panels, the top containing various control elements (Fig 12,1-4),
and the bottom panel containing the actual view of the parameter search results (Fig 12,5-7). The bottom view always contains set of instances of a specific figure
that was generated during the simulations in the parameter search. The figure instances are arranged into grid (Fig 12.5), such that the values of parameters assigned to the
two axis of the grid orderly vary along the axis, thus allowing user to gain insight into how do the properties of the simulations depicted in the selected figure change
with the changing parameter values. The vertical axes of the grid always corresponds to a single parameter (Fig 12.6), while the horizontal axis corresponds to the remaining
parameters whose values are hierarchically ordered (Fig 12.7). Usually the figures corresponding to all the explored parameter combinations cannot be viewed within the
screen at the same time, but user needs to scroll around the grid, however the horizontal and vertical guides will automatically scroll in-sync with the grid to provide
user a matching guide as to which parameter value combinations generated the viewed figures.

![Parameter search inspect page](/assets/images/screenshots/parameter_inspect_annotated.png)
_Figure 12: Parameter search inspect page._

In the top panel user can manipulate the exact information viewed in the figure grid at the bottom. User can select which of the multiple figures generated for each
simulation within the parameter search to display (Fig 12.1). User can adjust the size of the individual figures in the grid to gain appropriate view of the information
depicted in them (Fig 12.2). Below, the list of the parameters that varied during parameter search is displayed (Fig 12.3; any parameters that did not vary are automatically excluded
by Arkheia). Upon clicking any of the parameter names, that parameter is selected to be viewed along the y-axis of the grid, while remaining are assigned to the x-axis.
Furthermore, next to each parameter the list of different values that were assigned to the parameter during the search are displayed. Each can be clicked, by which
user toggles whether that parameter value should be included in the grid or not. Any parameters for which single value remains selected are automatically removed
from the horizontal guideline (unless it is selected for the vertical guideline) in order to reduce clutter. This way user can flexibly select different slices through the multi-dimensional parameter search space which can be powerful way to gain insight into such inherently complex data. The parameter list panel can be disabled
to gain more space for viewing of the grid (Fig 12.4). Finally upon clicking on any of the figures in the grid view, the figure will be displayed at full-size in a pop-over
panel, which will at the top also contains controls for navigating through all the other figures that the given simulation run (i.e. corresponding to the given
combination of parameter values) generated (Fig 13).

![Parameter search inspect page - full-sreen](/assets/images/screenshots/parameter_inspect_fs.png)
_Figure 13: Parameter search inspect page - full-screen._

# Client 

Arkheia offers users a convenient way of organizing, exploring and publishing their neural simulation specifications and results via a dedicated web application. 
To find out how to install and deploy Arkheia please refer to the [Installation & Deployment](./install.html) section of the documentation.
The Arkheia follows the common client-server architecture. To learn how to communicate with the server, and extend Arkheia to be compatible with your 
favorite simulation work-flow, please refer to the [API](./api.html) part of the documentation. Furthermore, if you want to learn more about the motivations behind
Arkheia design, or gain inspiration for various possible use-cases, read the [Arkheia manuscript](placeholder). Should you use Arkheia in your scientific project
resulting in publication, please cite this paper.

## Landing page

When accessing an instance of Arkheia repository, user will first see the landing page depicted in figure ?. This page can be always accessed again
via the *About* item of the top menu strip, or upon clicking the Arkheia logo on the left side of the top menu strip.

![About page](./screenshots/about_annotated.png)

The center of the landing page is occupied with the welcome message that can be customized by the user to tell visitors basic information
about the given repository instance (Fig ?.1, refer to [API](./api.html) on how to change the message). The Arkheia [documentation][placeholder] 
can be accessed via the *Documentation* item in the top menu strip (Fig ?.4). Arkheia allows sharing of two types of simulation results: 

1. Individual simulation runs can be accessed via the *Simulation runs* item of the top menu strip (Fig ?.2).
2. Sets of simulation runs resulting from parameter searches can be accessed via the *Parameter searches* item of the top menu strip (Fig ?.3).

## Individual simulation runs page

The *simulation runs* page offers a simple tabular representation of the set of simulation runs that were submitted to the repository, with each
row corresponding to single simulation run, and each column representing one simulation run property. The first four columns tell user (in this order)
when the given simulation run was submitted to the repository (Fig ?.1), when was the actual simulation executed (Fig ?.2), the name the user gave to 
that specific simulation run (Fig ?.3) and the name of the model that was simulated (Fig ?.4). The next four columns contain links (the 'eye' icons) 
that take the user to pages further exploring the content of the given simulation run. From left to right, user can explore the full parametrization
of the simulation (Fog ?.5), view all the stimuli that have been presented to the model )Fig ?.6). 
// Agent stopper in project GuardianPatrol.mas2j

/* Initial beliefs and rules */


/* Initial goals */

//!start.

/* Plans */
/* If robber stops first, check that guard finished also */
+stoprobber: stopguardian <-
	!stop.

/* If guard stops first, check that robber finished also */
+stopguardian: stoprobber <-
	!stop.

+!stop <-
	.println("End of simulation");
	.wait(200);
	.stopMAS.
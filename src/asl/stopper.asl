// Agent stopper in project GuardianPatrol.mas2j



/* Initial beliefs and rules */



/* Initial goals */



//!start.


// TODO : Guardian stop not working correctly. Solve after model extension
/* Plans */
/* If robber stops first, check that guard finished also */
+stoprobber: true <- //stopguardian <-
	!stop.

/* If guard stops first, check that robber finished also */
+stopguardian: stoprobber <-
	!stop.

+!stop <-
	.println("End of simulation");
	.wait(5000);
	.stopMAS.

/* Old version */
/**
+X : stopguardian[source(guardian)] & 
     stoprobber[source(robber)] <- 
     .println("Bye world.");
     .stopMAS.
*/
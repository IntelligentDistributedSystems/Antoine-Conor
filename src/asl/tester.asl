// Agent tester in project Antoine-Conor

/* Initial beliefs and rules */


/* Initial goals */

!start.

/* Plans */

+!start : true <-
	internalActions.config(n,A);
	.println(A).

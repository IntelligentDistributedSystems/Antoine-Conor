// Agent stopper in project GuardianPatrol.mas2j



/* Initial beliefs and rules */



/* Initial goals */



!start.



/* Plans */



+X : stopguardian[source(guardian)] & 
     stoprobber[source(robber)] <- 
     .println("Bye world.");
     .stopMAS.

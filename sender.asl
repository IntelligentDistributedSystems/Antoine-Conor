// Agent sender in project GuardianPatrol.mas2j



/* Initial beliefs and rules */



/* Initial goals */



!start.


+!start : true <- 
    //.print("hello world.");
    // .wait(2000);
    .send(robber,tell,hello);
    .send(guardian,tell,hello);
    !!start.

// Agent tester in project Antoine-Conor

/*
parent(Y,X) :- enfant(X,Y).

pere(X,Y) :- parent(X,Y),homme(X).
mere(X,Y) :- parent(X,Y),femme(X).

fils(X,Y) :- enfant(X,Y),homme(X).
fille(X,Y) :- enfant(X,Y),femme(X).
 
 */
/* Initial beliefs and rules */

guardian_strategy([0,0,0,1],[0,0,0,4]).

/* Selecting patrol from strat */

p(Xs, 1, R).

p(Xs, N):-
	p([0 | Xs], N - 1).

init(1,K,[K]).

init(M,K,[0|Xs]) :-
  	M > 0 &
  	init(M-1,K,Xs).


/* Initial goals */

!start.

/* Plans */

+!start : true <-
	?number_possible_patrols(N);
    ?probability_resolution(K);
    /*
     * Following line is dynamic implementation of config loading
     * Backup : ?guardian_patrols(N);
     */
     ?init(6,6,L1);
     .print(L1);

    .stopMAS.

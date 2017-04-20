// Agent guardian in project GuardianPatrol.mas2j

/* Initial beliefs and rules */

/* Guardian patrols: 1, 2, 3, 4 */
/* action(patrol,Parameter) */
/* Parameter = identify patrol: 1, 2, 3, 4 */
/* action(patrol,2) */
/* N = 4 */
// Uneeded : guardian_patrols(4).

/* Maximum number of iterations per episode */
// Uneeded : iterations(20).

/* Guardian strategy: [q1, q2, ..., qn] such that
-- n is the number of patrols
-- 1 >= qi >= 0 is probability of attack i
-- sum qi = 1
-- Number of strategies is comb(n+k-1,n-1)
-- comb(3+4-1,4-1) = comb(6,3) = 20
*/
guardian_strategy([0,0,0,1],[0,0,0,4]).


/* Probability resolution: K */
/* K = 3 */
// Uneeded : probability_resolution(3).

/* Select guardian patrol according to the current strategy. *
/* select_patrol(+X,+L,-I)
   X = random number in [0,1]
   mixed strategy L = [P1, P2, ..., PN] P1 + P2 + ... + PN = 1
   N is the number of attacks
   Intervals: 1 [0,P1], 2 (P1, P1+P2], ..., N (P1+P2+...PN-1,1] 
   I is the selected attack. */

select_patrol(I) :- 
   .random(X) &
   guardian_strategy(L,_) &
   select_patrol1(X,L,I).
   
select_patrol1(X,L,I) :-
   interval(X,L,I,0,1).

interval(X,[P | _],I,Pt,I) :-
   X <= P+Pt.

interval(X,[P | L],I,Pt,It) :-
   X > P+Pt &
   interval(X,L,I,P+Pt,It+1).

/*
   next(+Xs,-Ys).
   Determines the successor Ys in lexicographical order of a list Xs. Xs contains
   N elements X1 ... XN of natural numbers such that their sum is K. The first
   element of Xs has the smallest rank.
   The first element for starting the generating process must be the N-element
   list [K, 0, ..., 0].
*/
next(Xs,Ys) :-
   count_0(Xs,Ys,0).

/* If the head of Xs is 0 */
count_0([0 | Xs],Ys,I) :-
   count_0(Xs,Ys,I+1).

/* If Xs doesn't start with a 0 
 * I represents the number of 0's at the start of the list before next(Xs, Ys)
 */
count_0([X | Xs],[Y | Ys],I) :-
   Y = X-1 &
   set_0(Xs,Ys,I).

set_0(Xs,[0 | Ys],I) :-
   I > 0 &
   I1 = I-1 &
   set_0(Xs,Ys,I1).
   
set_0([X | Xs],[X+1 | Xs],0).

/* init(+N,+K,-Xs) generates the first N-element list Xs = [K, 0, ..., 0]
 * call : ?init(N,K,L1);
 * */
init(1,K,[K]).

init(M,K,[0|Xs]) :-
  M > 0 &
  init(M-1,K,Xs).
  
/* gen_prob(+L,+K,-S) */
gen_prob([],_,[]).
gen_prob([X | Xs],K,[X/K | Ys]) :-
   gen_prob(Xs,K,Ys).

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
    ?init(N,K,L1);
    .reverse(L1,L);
    ?gen_prob(L,K,Strategy);
    -+guardian_strategy(Strategy,L);
    !do_episodes.

+!do_episodes : guardian_strategy(S,_) <-
    ?iterations(MaxIter);
    !do_actions(1,MaxIter).
     
+!do_actions(Iter,MaxIter) : Iter <= MaxIter <-
    -+crt_iter(Iter);
    !do_action(Iter).
//    !do_action(Iter);
//    !!do_actions(Iter+1,MaxIter).
     
+!do_action(Iter) : true <-
    ?select_patrol(Patrol);
    Action = action(patrol,Patrol);
    //.println("Do action ",Action," for the ",Iter,"-th time.");
    Action.

+!do_actions(Iter,MaxIter) : Iter > MaxIter <-
    ?guardian_strategy(_,L);
    ?next(L,L1);
    ?probability_resolution(K);
    ?gen_prob(L1,K,Strategy);
    -+guardian_strategy(Strategy,L1);
    !do_episodes.

-!do_actions(_,_) : true <-
    .println("Finished working !");
    .send(stopper,tell,stopguardian).

+perc(I,R,A,P,Ur,Ug)[source(percept)] : crt_iter(Iter) <-
    -perc(I,R,A,P,Ur,Ug)[source(percept)];
    .println(Iter," : ", percept(I,R,A,P,Ur,Ug));
    ?iterations(MaxIter);
    !do_actions(Iter+1,MaxIter).
    
+hello : true <-
    -hello[source(sender)].

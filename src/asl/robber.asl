// Agent robber in project GuardianPatrol.mas2j

/* Initial beliefs and rules */


/* Robber types: 1, 2 */
// Dynamically loaded : robber_types(R).

/* Robber attacks: 1, 2, 3 */
/* action(attack,Type,Parameter) */
/* Type = robber type */
/* Parameter = identify attack: 1, 2, 3 */
/* action(attack,1,3) */
// Dynamically loaded : robber_attacks(A).

/* Maximum number of iterations */
// Dynamically loaded :  iterations(I).

/* Robber strategy: [p1, p2, ..., pn] such that
-- n is the number of attacks
-- 1 >= pi >= 0 is probability of attack i
-- sum pi = 1
*/
// Dynamically loaded :  robber_strategy(Strat).

/* Select robber type. */  
select_type(T) :-
    .random(U) &
    robber_types(NoOfTypes) &
    select_type1(U,NoOfTypes,T).

select_type1(U,NoOfTypes,T) :-
    select_type2(U,NoOfTypes,T,1,1.0/NoOfTypes).

select_type2(U,NoOfTypes,T,T,P) :-
    U <= P.
select_type2(U,NoOfTypes,T,I,P) :-
    U > P &
    select_type2(U,NoOfTypes,T,I+1,P+1.0/NoOfTypes).
    
/* select robber attack according to the current strategy. *
/* select_attack(+X,+L,-I)
   X = random number in [0,1]
   mixed strategy L = [P1, P2, ..., PN] P1 + P2 + ... + PN = 1
   N is the number of attacks
   Intervals: 1 [0,P1], 2 (P1, P1+P2], ..., N (P1+P2+...PN-1,1] 
   I is the selected attack. */

select_attack(I) :-
   .random(X) &
   robber_strategy(L) &
   select_attack1(X,L,I).
   
select_attack1(X,L,I) :-
   interval(X,L,I,0,1).

interval(X,[P | _],I,Pt,I) :-
   X <= P+Pt.

interval(X,[P | L],I,Pt,It) :-
   X > P+Pt &
   interval(X,L,I,P+Pt,It+1).


/* Initial goals */

!start.

/* Plans */

+!start : true <- 
//  .println("Hello world !");
//  .wait(10000);
    ?iterations(MaxIter);
    !do_actions(1,MaxIter).
    
+!do_actions(Iter,MaxIter) : Iter <= MaxIter <-
//    !do_action(Iter);
//    !!do_actions(Iter+1,MaxIter).
    -+crt_iter(Iter);
    !do_action(Iter).
     
+!do_action(Iter) : true <-
    ?select_type(Type);
    ?select_attack(Attack);
    Action = action(attack,Type,Attack);
    //.println("Do action ",Action," for the ",Iter,"-th time.");
    Action.
  
+!do_actions(Iter,MaxIter) : Iter > MaxIter <-
    //.println("Finished working !");
    .send(stopper,tell,stoprobber).

+perc(I,R,A,P,Ur,Ug)[source(percept)] : crt_iter(Iter) <-
    -perc(I,R,A,P,Ur,Ug)[source(percept)];
    // .println(Iter," : ", percept(I,R,A,P,Ur,Ug));
    ?iterations(MaxIter);
    !do_actions(Iter+1,MaxIter).

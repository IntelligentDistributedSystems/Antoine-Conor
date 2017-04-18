package helpers;

public class Helpers {
	public static int choose(int x, int y) {
	    if (y < 0 || y > x) return 0;
	    
	    // choose(n,k) == choose(n,n-k), reduces calculation time
	    if (y > x/2) {
	        y = x - y;
	    }

	    int answer = 1;
	    for (int i = 1; i <= y; i++) {
	        answer *= (x + 1 - i);
	        answer /= i;           // humor 280z80
	    }
	    return answer;
	}
}

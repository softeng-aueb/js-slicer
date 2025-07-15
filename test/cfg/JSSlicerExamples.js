const obj = {
    a: (a, b) => {
        let c = a + b * 2;
        for (let a of d) {
            if (a >= b) {
                console.log(a);
            } else {
                console.log(b);
            }
            c--;
        }
        return a + b;
    },
};

function foo(a, b) {
    //IDS:
    let c = a + b; //1
    console.log(a); //2
    //      3         4     13
    for (let i = 0; i < c; i++) {
        //5
        if (i > 5) {
            a--; //6
            break; //7
        }
        //8
        else if (i == 3) {
            a++; //9
            continue; //10
        } else {
            b++; //11
        }
        console.log(a + b); //12
    }
    return; //14
}

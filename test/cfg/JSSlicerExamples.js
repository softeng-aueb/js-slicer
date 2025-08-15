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

let generic = (a, b) => {
    let c = a + b;
    console.log(a);
    if (a > 0 && b < 10) {
        a++;
        b++;
        console.log(a);
    } else if (c > 15) {
        c++;
        a++;
        if (c + b < 40) {
            a++;
        } else {
            c++;
        }
        b++;
        if (a < 5 && b < 5) {
            c++;
        } else {
            b++;
        }
    } else {
        a++;
        b++;
    }
    return c;
};

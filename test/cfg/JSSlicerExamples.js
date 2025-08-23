const obj = {
    a: (a, b) => {
        let c = a + b * 2;
        b = (a, b) => {
            return b;
        };
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

let switchFunc = (a, c, b) => {
    switch (a) {
        case 2: {
            console.log(a);
        }
        case 4: {
            console.log(b);
        }
        default: {
            console.log(c);
        }
        case 10: {
            return a + b;
        }
    }
};

const sayHello = function (name) {
    const test = async function (a, b = true) {};
    return "Hello " + name;
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
            return a;
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

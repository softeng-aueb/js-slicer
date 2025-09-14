const obj = {
    a: (a, b) => {
        let c = a + b * 2;
        let f1 = (a, b) => {
            return b * a;
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
function tryStmt() {
    try {
        if (a > b) console.log("try start");

        if (stmt) {
            console.log(1);
            console.log(2);
        } else if (stmt != undefined) {
            console.log(3);
        } else {
            console.log(4);
        }
    } catch (error) {
        console.log(5);
        console.log(6);
    } finally {
        console.log("FINAL");
    }
    console.log("try end");

    return;
}

let switchFunc = (a, c, b) => {
    let i = 0; //1
    switch (
        a //2
    ) {
        case 1: {
            i++; //3
        }
        case 2:
            c++; //4
            break; //5

        case !i: {
            i++; //6
            break; //7
        }
    }
};

const nestedFunctions = function (name) {
    const test = async function (a, b = true) {
        return a + b;
    };

    function test2(c) {
        return c;
    }

    let test3 = () => {
        console.log("Hello World");
    };

    return `Hello ${name}` + test(1, 2) + test2(3) + test3();
};

let generic = (a, b) => {
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


    let skip;

    let options = {
        classname: "toast",
        transition: "fade",
        insertBefore: true,
        duration: 30000,
        enableSounds: true,
        autoClose: true,
        progressBar: true,
        sounds: {
            info: "sounds/info/1.mp3",
            success: "sounds/success/1.mp3",
            warning: "sounds/warning/1.mp3",
            error: "sounds/error/1.mp3",
        },
        onShow: function (type) {
        },
        onHide: function (type) {
        },
        prependTo: document.body.childNodes[0]
    };
    
    let toast = new Toasty(options)
    toast.error("ciao")

    let select = $('#select')

    let inputNum = $('#num')

    inputNum.on("change", function() {
        console.log("inputNum changed")
        for (let i = 1; i < parseInt(inputNum.val()) + 1; i++) {
            select.append(new Option(i, i));
        }
    })

    let makeCRCTable = function () {
        let c;
        let crcTable = [];
        for (let n = 0; n < 256; n++) {
            c = n;
            for (let k = 0; k < 8; k++) {
                c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
            }
            crcTable[n] = c;
        }
        return crcTable;
    };
    function getParameterByName(name, base) {
        name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        let regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
        return results === null ? base : decodeURIComponent(results[1].replace(/\+/g, " "));
    }

    let crc32 = function (str) {
        let crcTable = window.crcTable || (window.crcTable = makeCRCTable());
        let crc = 0 ^ (-1);

        for (let i = 0; i < str.length; i++) {
            crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF];
        }

        return (crc ^ (-1)) >>> 0;
    };


    function Randomizer(seed) {
        return {
            seed: seed,
            random: function (max) {
                seed = (8253729 * (seed) + 2396403);

                seed = crc32(seed + "c" + seed);
                return (seed + Math.ceil(Math.sqrt(seed - 1))) % max;
            }

        }
    }



    function randomMatrix(n, l, seed, exclude) {
        console.log(exclude);
        let mat = new Array(Math.ceil((n - exclude.length) / l));
        let random = Randomizer(seed);

        let row = 0;
        let counter = 0;
        let column = 0;
        let curr, trovato;
        while (counter < n - exclude.length) {
            mat[row] = new Array(l);
            while (column < l && counter < n - exclude.length) {
                trovato = false;
                let loopStart = 0;
                do {
                    curr = random.random(n) + 1;
                   
                       
                    trovato = false;
                    for (x = 0; x <= row; x++) {
                        for (y = 0; y < l; y++) {
                            if (curr == mat[x][y] || exclude.includes( curr.toString())) {
                                trovato = true;
                                loopStart++;
                                if (loopStart > 10000) {
                                    toast.error("Errore nel loop")
                                    throw new Error("Errore nel loop!!!!!")
                                    
                                }

                            }

                        }
                    }
                } while (trovato);
                
                console.log("Quindi inserisco " + curr);
                mat[row][column] = curr;
                column++;
                counter++;
                
            }
            row++;
            column = 0;

        }
        console.log(mat);
        return mat;
    }

    function tabella(tag, mat) {
        let ris;
    
        ris = '<table class="table table-bordered table-striped">';
        for (i = 0; i < mat.length; i++) {
            ris = ris + '<tr>';
            for (j = 0; j < mat[i].length; j++) {
                if (typeof mat[i][j] != 'undefined') {
                    ris = ris + '<td width="' + 100 / mat[0].length + '%">' + mat[i][j] + "</td>"
                }
            }
            ris = ris + "</tr>"
        }
        ris = ris + "</table>";

        $(tag).html(ris)


    }

    function build(num,size,seed,exclude){
        let matrix = randomMatrix(num, size, seed, exclude);
        tabella("#result", matrix);
        $("#seed").html("Seed: "+seed)
        if(exclude.length > 0){
            $("#excluded").html("Esclusi: "+ exclude.join(", "))
        }

    }

    function buttonclick(ignore) {
        let seed, num, size, exclude;

        num= $('#num').val();
        size = $('#size').val();
        exclude = $('#select').val();
        
        console.log(exclude);

        if(ignore){
            seed = (getParameterByName("seed",Date.now()))
        }else{
            $("#button").addClass("d-none")
            $('#output_section').removeClass("d-none")
            seed = Date.now();
        }
        if(!skip){
            build(num,size,seed,exclude);
            return;
        }

    }

    $('#num').val(getParameterByName("num",19));
    for (let i = 1; i < parseInt(inputNum.val()) + 1; i++) {
            select.append(new Option(i, i));
        }
    $('#size').val(getParameterByName("size",4));
    skip = getParameterByName("skip",false);
    if(skip){
        $("#other").text("Non sara' inviato nulla per questa sessione!")
    }


    buttonclick(true);
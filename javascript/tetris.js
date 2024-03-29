/*今回のテトリスはワールドルールで実装
<テトリミノ>
I:水色
O:黄色
S:黄緑
Z:赤
J:青
L:オレンジ
T:紫
<7種1巡の法則>
・一度降ったミノは他のまだ出てないミノが出尽くすまで、つまり一巡するまで出ないというルール。
<盤面>
・横10マス×縦20マス
*/

class Tetris {
    constructor() {

        //canvas要素の大きさを取得
        this.nextFallingCanvasWidth = document.querySelector('#nextFallingCanvas').offsetWidth;
        this.nextFallingCanvasLength = document.querySelector('#nextFallingCanvas').offsetHeight;
        //横
        this.fallingBlockCanvasWidth = document.querySelector('#fallingBlockCanvas').offsetWidth;
        //縦
        this.fallingBlockCanvasLength = document.querySelector('#fallingBlockCanvas').offsetHeight;

        //英語では短い幅をwidth、長い幅をlengthのため、今回は、横幅をwidth,縦幅をlengthとする。
        //横幅は10,縦幅を20に設定
        this.stateWidth = 10;
        this.stateLength = 20;
        //横1幅
        this.rectangleWidth = this.fallingBlockCanvasWidth / 10;
        //縦1幅
        this.rectangleLength = this.fallingBlockCanvasLength / 20;

        //canvas要素を取得
        this.nextFallingCanvas = document.querySelector('#nextFallingCanvas');
        this.fallingBlockCanvas = document.querySelector('#fallingBlockCanvas');

        //canvas要素のコンテキストオブジェクトを取得(getcontextのCを大文字にしないとエラー発生)
        this.nextFallingContext = nextFallingCanvas.getContext('2d');
        this.fallingBlockContext = fallingBlockCanvas.getContext('2d');

        this.loopCount = 0;
        this.nextBlockLoopCountForNextBlock = 1;
        this.rorateCount = 0;
        this.movingBlock = [[0, 0], [0, 0], [0, 0], [0, 0]];
        this.nextBlock = [[0, 0], [0, 0], [0, 0], [0, 0]];
        this.allBlocksList = [];

        this.blocks = this.CreateBlocks();
        this.movingBlockColor = this.blocks[this.loopCount].color;
        this.nextBlockColor = this.blocks[this.nextBlockLoopCountForNextBlock].color;

        window.onkeydown = (event) => {
            //右
            if (event.keyCode === 39) {
                this.MoveRight();
            }
            //左
            if (event.keyCode === 37) {
                this.MoveLeft();
            }
            //上
            if (event.keyCode === 38) {
                this.Rotate();
            }
            //下
            if (event.keyCode === 40) {
                this.MoveDown();
            }
            // if (event.keyCode === 13) {
            //     console.log('Enter');
            // }
        }

        document.querySelector('.rotateButton').addEventListener('click', event => {
            this.Rotate();
        });

        document.querySelector('.moveLeftButton').addEventListener('mousedown', event => {
            this.MoveLeft();
        });
        document.querySelector('.moveDownButton').addEventListener('mousedown', event => {
            this.MoveDown();
        });
        document.querySelector('.moveRightButton').addEventListener('mousedown', event => {
            this.MoveRight();
        });

        //コンストラクタ生成時点でCanvasに枠線を描画する
        this.PaintFallingCanvas();

    }

    set movingBlockField(value) {
        this.movingBlock[value[1]] = value[0];
    }

    get movingBlockField() {
        return this.movingBlock;
    }

    set nextBlockField(value) {
        this.nextBlock[value[1]] = value[0];
    }

    get nextBlockField() {
        return this.nextBlock;
    }

    set rorateCountField(value) {
        if (this.rorateCount === 3) {
            this.rorateCount = 0;
        } else {
            this.rorateCount = value;
        }
    }

    get rorateCountField() {
        return this.rorateCount;
    }

    ClearFallingCanvas() {
        this.fallingBlockContext.clearRect(0, 0, this.fallingBlockCanvasWidth, this.fallingBlockCanvasLength);
    }

    PaintFallingCanvas() {
        this.fallingBlockContext.fillStyle = 'black';
        //横幅の色を塗る
        for (let i = 0; i < this.stateWidth; i++) {
            this.fallingBlockContext.strokeRect(i * this.rectangleWidth, 0, this.fallingBlockCanvasWidth, this.fallingBlockCanvasLength);
        }
        //縦幅の色を塗る
        for (let l = 0; l < this.stateLength; l++) {
            this.fallingBlockContext.strokeRect(0, l * this.rectangleLength, this.fallingBlockCanvasWidth, this.fallingBlockCanvasLength);
        }
    }

    MoveRight() {
        //一旦描画したものを初期化する必要がある
        this.ClearFallingCanvas();
        this.fallingBlockContext.fillStyle = this.movingBlockColor;

        //移動する前のブロックを保持(let cloneBlock = this.movingBlockだと参照先が渡されるので、配列の値をコピーして代入する必要有
        let cloneBlock = this.movingBlock.concat();

        //一旦movingBlockに加算
        for (let i = 0; i < this.movingBlock.length; i++) {
            this.movingBlockField = [[this.movingBlock[i][0] + this.rectangleWidth, this.movingBlock[i][1], this.rectangleWidth, this.rectangleLength], i];
        }
        //加算した結果、canvasの範囲を超える場合は、cloneBlockを代入する
        if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
            this.movingBlock = cloneBlock;
        }
        //movingBlockを描画
        for (let i = 0; i < this.movingBlock.length; i++) {
            this.fallingBlockContext.fillRect(this.movingBlock[i][0], this.movingBlock[i][1], this.rectangleWidth, this.rectangleLength);
        }
        /*----------存在する全てのブロックを表示する----------*/
        this.DisplayAllBlocks();
        /*-------------------------------------------------*/

    }

    MoveLeft() {
        this.ClearFallingCanvas();
        this.fallingBlockContext.fillStyle = this.movingBlockColor;

        let cloneBlock = this.movingBlock.concat();

        for (let i = 0; i < this.movingBlock.length; i++) {
            this.movingBlockField = [[this.movingBlock[i][0] - this.rectangleWidth, this.movingBlock[i][1], this.rectangleWidth, this.rectangleLength], i];
        }
        if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
            this.movingBlock = cloneBlock;
        }
        //movingBlockを描画
        for (let i = 0; i < this.movingBlock.length; i++) {
            this.fallingBlockContext.fillRect(this.movingBlock[i][0], this.movingBlock[i][1], this.rectangleWidth, this.rectangleLength);
        }

        /*----------存在する全てのブロックを表示する----------*/
        this.DisplayAllBlocks();
        /*-------------------------------------------------*/


    }

    MoveDown() {

        if (this.CheckMoveDown(this.movingBlock)) {
            this.ClearFallingCanvas();
            this.fallingBlockContext.fillStyle = this.movingBlockColor;

            for (let i = 0; i < this.movingBlock.length; i++) {
                this.fallingBlockContext.fillRect(this.movingBlock[i][0], this.movingBlock[i][1] + this.rectangleLength, this.rectangleWidth, this.rectangleLength);
                this.movingBlockField = [[this.movingBlock[i][0], this.movingBlock[i][1] + this.rectangleLength, this.rectangleWidth, this.rectangleLength], i];
            }
            /*----------存在する全てのブロックを表示する----------*/
            this.DisplayAllBlocks();
            /*-------------------------------------------------*/

        }
    }

    //右回転
    Rotate() {
        this.ClearFallingCanvas();
        this.fallingBlockContext.fillStyle = this.movingBlockColor;
        let cloneBlock;
        console.log(`回転する際のカラー:${this.movingBlockColor}`);
        //Blockの中を入れ替える
        if (this.movingBlockColor === 'yellow') {
            //四角用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.movingBlock[2], this.movingBlock[0], this.movingBlock[3], this.movingBlock[1]];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        } else if (this.movingBlockColor === '#FF66FF') {
            //T字用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.movingBlock[1], this.movingBlock[3], this.movingBlock[2], this.InvertCenter(this.movingBlock[3])];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        } else if (this.movingBlockColor === 'green') {
            //S字用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.movingBlock[3], this.InvertEdge(this.movingBlock[1]), this.movingBlock[2], this.InvertCenterForS(this.movingBlock[3])];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        } else if (this.movingBlockColor === 'red') {
            //Z字用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.InvertEdgeForZ(this.movingBlock[0]), this.movingBlock[3], this.movingBlock[2], this.InvertCenter(this.movingBlock[3])];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        } else if (this.movingBlockColor === 'blue') {
            //J字用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.InvertEdgeForZ(this.movingBlock[0]), this.InvertCenterForJ(this.movingBlock[1]), this.movingBlock[2], this.InvertCenter(this.movingBlock[3])];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        } else if (this.movingBlockColor === '#FF6600') {
            //L字用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.InvertEdge(this.movingBlock[0]), this.InvertCenterForJ(this.movingBlock[1]), this.movingBlock[2], this.InvertCenter(this.movingBlock[3])];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        } else if (this.movingBlockColor === 'aqua') {
            //横棒用
            cloneBlock = this.movingBlock;
            this.movingBlock = [this.InvertCenterForJ(this.movingBlock[0]), this.movingBlock[1], this.InvertCenter(this.movingBlock[2]), this.InvertCenterForBar(this.movingBlock[3])];
            if (this.CheckMoveAndRotate(this.movingBlock) === false || this.CheckAlreadyExistBlock(this.movingBlock) === true) {
                this.movingBlock = cloneBlock;
            } else {
                this.rorateCountField = this.rorateCount + 1;
            }
        }

        for (let i = 0; i < this.movingBlock.length; i++) {
            this.fallingBlockContext.fillRect(this.movingBlock[i][0], this.movingBlock[i][1], this.rectangleWidth, this.rectangleLength);
        }
        /*----------存在する全てのブロックを表示する----------*/
        this.DisplayAllBlocks();
        /*-------------------------------------------------*/

    }

    InvertCenter(targetBlock) {
        let invertedBlock;
        if (this.rorateCount === 0) {
            invertedBlock = [targetBlock[0] - this.rectangleWidth, targetBlock[1] + this.rectangleLength];
        } else if (this.rorateCount === 1) {
            invertedBlock = [targetBlock[0] - this.rectangleWidth, targetBlock[1] - this.rectangleLength];
        } else if (this.rorateCount === 2) {
            invertedBlock = [targetBlock[0] + this.rectangleWidth, targetBlock[1] - this.rectangleLength];
        } else if (this.rorateCount === 3) {
            invertedBlock = [targetBlock[0] + this.rectangleWidth, targetBlock[1] + this.rectangleLength];
        }
        return invertedBlock;
    }

    InvertCenterForS(targetBlock) {
        let invertedBlock;
        if (this.rorateCount === 1) {
            invertedBlock = [targetBlock[0] - this.rectangleWidth, targetBlock[1] + this.rectangleLength];
        } else if (this.rorateCount === 2) {
            invertedBlock = [targetBlock[0] - this.rectangleWidth, targetBlock[1] - this.rectangleLength];
        } else if (this.rorateCount === 3) {
            invertedBlock = [targetBlock[0] + this.rectangleWidth, targetBlock[1] - this.rectangleLength];
        } else if (this.rorateCount === 0) {
            invertedBlock = [targetBlock[0] + this.rectangleWidth, targetBlock[1] + this.rectangleLength];
        }
        return invertedBlock;
    }

    InvertCenterForJ(targetBlock) {
        let invertedBlock;
        if (this.rorateCount === 2) {
            invertedBlock = [targetBlock[0] - this.rectangleWidth, targetBlock[1] + this.rectangleLength];
        } else if (this.rorateCount === 3) {
            invertedBlock = [targetBlock[0] - this.rectangleWidth, targetBlock[1] - this.rectangleLength];
        } else if (this.rorateCount === 0) {
            invertedBlock = [targetBlock[0] + this.rectangleWidth, targetBlock[1] - this.rectangleLength];
        } else if (this.rorateCount === 1) {
            invertedBlock = [targetBlock[0] + this.rectangleWidth, targetBlock[1] + this.rectangleLength];
        }
        return invertedBlock;
    }

    InvertEdge(targetBlock) {
        let invertedBlock;
        if (this.rorateCount === 0) {
            invertedBlock = [targetBlock[0], targetBlock[1] + 2 * this.rectangleLength];
        } else if (this.rorateCount === 1) {
            invertedBlock = [targetBlock[0] - 2 * this.rectangleWidth, targetBlock[1]];
        } else if (this.rorateCount === 2) {
            invertedBlock = [targetBlock[0], targetBlock[1] - 2 * this.rectangleLength];
        } else if (this.rorateCount === 3) {
            invertedBlock = [targetBlock[0] + 2 * this.rectangleWidth, targetBlock[1]];
        }
        return invertedBlock;
    }

    InvertEdgeForZ(targetBlock) {
        let invertedBlock;
        if (this.rorateCount === 1) {
            invertedBlock = [targetBlock[0], targetBlock[1] + 2 * this.rectangleLength];
        } else if (this.rorateCount === 2) {
            invertedBlock = [targetBlock[0] - 2 * this.rectangleWidth, targetBlock[1]];
        } else if (this.rorateCount === 3) {
            invertedBlock = [targetBlock[0], targetBlock[1] - 2 * this.rectangleLength];
        } else if (this.rorateCount === 0) {
            invertedBlock = [targetBlock[0] + 2 * this.rectangleWidth, targetBlock[1]];
        }
        return invertedBlock;
    }

    InvertCenterForBar(targetBlock) {
        let invertedBlock;
        if (this.rorateCount === 0) {
            invertedBlock = [targetBlock[0] - 2 * this.rectangleWidth, targetBlock[1] + 2 * this.rectangleLength];
        } else if (this.rorateCount === 1) {
            invertedBlock = [targetBlock[0] - 2 * this.rectangleWidth, targetBlock[1] - 2 * this.rectangleLength];
        } else if (this.rorateCount === 2) {
            invertedBlock = [targetBlock[0] + 2 * this.rectangleWidth, targetBlock[1] - 2 * this.rectangleLength];
        } else if (this.rorateCount === 3) {
            invertedBlock = [targetBlock[0] + 2 * this.rectangleWidth, targetBlock[1] + 2 * this.rectangleLength];
        }
        return invertedBlock;
    }

    CheckMoveAndRotate(targetBlock) {
        let flgMoveAndRorate = true;
        for (let i = 0; i < targetBlock.length; i++) {
            if (targetBlock[i][0] >= this.fallingBlockCanvasWidth || targetBlock[i][0] < 0 || targetBlock[i][1] < 0) {
                flgMoveAndRorate = false;
            }
        }
        return flgMoveAndRorate;
    }

    //下に移動できるかどうかチェック
    CheckMoveDown(targetBlock) {
        let flgMoveDown = true;
        for (let i = 0; i < targetBlock.length; i++) {
            //落下中のブロックが底からはみ出してしまうかチェック
            if (targetBlock[i][1] + this.rectangleLength >= this.fallingBlockCanvasLength/* || targetBlock[i][1] < 0*/) {
                flgMoveDown = false;
            }
            //表示されている全ブロックと比較し、ブロックが重なってしまうかチェック
            this.allBlocksList.forEach((value) => {
                for (let l = 0; l < value.shape.length; l++) {
                    if (value.shape[l] !== undefined && value.shape[l] !== null) {
                        if (targetBlock[i][1] + this.rectangleLength === value.shape[l][1] && targetBlock[i][0] === value.shape[l][0]) {
                            flgMoveDown = false;
                            break;
                        }
                    }
                }
            });
        }
        return flgMoveDown;
    }

    CreateBlocks() {
        // 元の配列の複製を作成
        let sourceArr = [
            {/*T字を作成
                    □
                   □□□
                */
                shape: [[0, 1], [1, 0], [1, 1], [2, 1]],
                color: '#FF66FF'
            },
            {/*L字を作成
                      □
                    □□□
                */
                shape: [[2, 0], [0, 1], [1, 1], [2, 1]],
                color: '#FF6600'
            },
            {/*逆L字(J)を作成
                    □  
                    □□□
                */
                shape: [[0, 0], [0, 1], [1, 1], [2, 1]],
                color: 'blue'
            },
            {/*Z字を作成
            □□
             □□
            */
                shape: [[0, 0], [1, 0], [1, 1], [2, 1]],
                color: 'red'
            },
            {/*逆Z字(S字)を作成
                     □□
                    □□
                */
                shape: [[0, 1], [2, 0], [1, 1], [1, 0]],
                color: 'green'
            },
            {/*四角を作成
                   □□
                　 □□
                */
                shape: [[0, 0], [0, 1], [1, 0], [1, 1]],
                color: 'yellow'
            },

            {/*横長棒を作成
                □□□□
            */
                shape: [[0, 0], [1, 0], [2, 0], [3, 0]],
                color: 'aqua'
            },


        ];
        const array = sourceArr.concat();
        // Fisher–Yatesのアルゴリズム
        const arrayLength = array.length;
        for (let i = arrayLength - 1; i >= 0; i--) {
            const randomIndex = Math.floor(Math.random() * (i + 1));
            [array[i], array[randomIndex]] = [array[randomIndex], array[i]];
        }
        return array;
    }

    DisplayNextBlock() {
        this.nextFallingContext.clearRect(0, 0, this.nextFallingCanvasWidth, this.nextFallingCanvasLength);

        this.nextFallingContext.fillStyle = this.nextBlockColor;
        for (let i = 0; i < this.blocks[this.nextBlockLoopCountForNextBlock].shape.length; i++) {
            this.nextFallingContext.fillRect(this.nextBlock[i][0], this.nextBlock[i][1] + this.rectangleLength,
                this.rectangleWidth, this.rectangleLength);
        }

        //横幅の色を塗る
        for (let i = 0; i < this.stateWidth; i++) {
            this.nextFallingContext.strokeRect(i * this.rectangleWidth, 0, this.fallingBlockCanvasWidth, this.fallingBlockCanvasLength);
        }
        //縦幅の色を塗る
        for (let l = 0; l < 5; l++) {
            this.nextFallingContext.strokeRect(0, l * this.rectangleLength, this.fallingBlockCanvasWidth, this.fallingBlockCanvasLength);
        }

    }

    DisplayAllBlocks() {

        //Listの中身を全表示することで、全てのブロックを表示する
        this.allBlocksList.forEach((value) => {
            this.fallingBlockContext.fillStyle = value.color;
            for (let i = 0; i < value.shape.length; i++) {
                if (value.shape[i] !== undefined && value.shape[i] !== null) {
                    this.fallingBlockContext.fillRect(value.shape[i][0], value.shape[i][1], this.rectangleWidth, this.rectangleLength);
                }
            }
        });
        //枠線の描画
        this.PaintFallingCanvas();
    }

    //Canvas内に揃った行があるかどうか調べる
    CheckRowComplete() {
        //1行を大きなループとする
        for (let i = 0; i < this.stateLength; i++) {
            //1列毎にブロックが存在するかチェック
            for (let l = 0; l < this.stateWidth; l++) {
                let existBlockFlag = null;
                for (let k = 0; k < 4; k++) {
                    existBlockFlag = this.allBlocksList.some((block) => {

                        if (block.shape[k] !== undefined && block.shape[k] !== null) {
                            return block.shape[k][0] === l * this.rectangleWidth
                                && block.shape[k][1] === (this.stateLength - (i + 1)) * this.rectangleLength
                        }
                    });

                    if (existBlockFlag) {
                        break;
                    }
                }
                if (!existBlockFlag) {
                    break;
                }
                if (l === 9 && existBlockFlag) {
                    //配列の要素を消去
                    console.log(`${this.stateLength - (i + 1)}の行が1列揃いました！`);
                    this.allBlocksList.forEach(value => {
                        for (let m = 0; m < value.shape.length; m++) {
                            if (value.shape[m] !== undefined && value.shape[m] !== null) {
                                if (value.shape[m][1] === (this.stateLength - (i + 1)) * this.rectangleLength) {
                                    delete value.shape[m];
                                }
                            }
                        }
                    });

                    //対象行より上のブロックを一段下に移動する
                    this.FallTargetsBlocks(this.stateLength - (i + 1));
                    //i=i-1とすることで、一段下に移動したブロックも判定対象にする
                    i = i - 1;
                }
            }
        }
        this.ClearFallingCanvas();
        this.DisplayAllBlocks();
    }

    //指定した行より上のブロックを全て1段下に落とす
    FallTargetsBlocks(targetRow) {
        this.allBlocksList.forEach(value => {
            for (let i = 0; i < value.shape.length; i++) {
                if (value.shape[i] !== undefined && value.shape[i] !== null) {
                    if (value.shape[i][1] < targetRow * this.rectangleLength) {
                        console.log(`value.shape[i][1]:${value.shape[i][1]},targetRow*this.rectangleLength:${targetRow * this.rectangleLength}`);
                        value.shape[i][1] = value.shape[i][1] + this.rectangleLength;
                        console.log(`value.shape[i][1]:${value.shape[i][1]}`)
                    }
                }
            }
        });

    }

    //対象のブロックが重なるかチェックする
    CheckAlreadyExistBlock(targetBlock) {
        let flgExistBlock = false;
        for (let i = 0; i < targetBlock.length; i++) {
            this.allBlocksList.forEach((value) => {
                for (let l = 0; l < value.shape.length; l++) {
                    if (value.shape[l] !== undefined && value.shape[l] !== null) {
                        if (targetBlock[i][1] === value.shape[l][1] && targetBlock[i][0] === value.shape[l][0]) {
                            flgExistBlock = true;
                            break;
                        }
                    }
                }
            });
        }
        return flgExistBlock;
    }


};

const createCanvasOutline = (tetris) => {
    //context.lineWidthで線の幅を取得(1以上にすると線の幅も幅の計算に入る)
    tetris.nextFallingContext.linewidth = 0;
    tetris.fallingBlockContext.linewidth = 0;

    tetris.nextFallingContext.strokeRect(0, 0, tetris.nextFallingCanvasWidth, tetris.nextFallingCanvasLength);

    //Blockを選択する
    for (let i = 0; i < tetris.blocks[tetris.loopCount].shape.length; i++) {
        tetris.movingBlockField = [[tetris.rectangleWidth * tetris.blocks[tetris.loopCount].shape[i][0]
            + 3 * tetris.rectangleWidth, tetris.rectangleLength * tetris.blocks[tetris.loopCount].shape[i][1] - tetris.rectangleLength], i];
    }
    //Blockの色も設定
    tetris.movingBlockColor = tetris.blocks[tetris.loopCount].color;
    if (tetris.nextBlockLoopCountForNextBlock + 1 === 7) {
        tetris.nextBlockLoopCountForNextBlock = 0;
        tetris.blocks = tetris.CreateBlocks();
    } else {
        tetris.nextBlockLoopCountForNextBlock = tetris.loopCount + 1;
    }
    tetris.nextBlockColor = tetris.blocks[tetris.nextBlockLoopCountForNextBlock].color;

    //次に落ちるBlockを選択する
    for (let i = 0; i < tetris.blocks[tetris.nextBlockLoopCountForNextBlock].shape.length; i++) {
        tetris.nextBlockField = [[tetris.rectangleWidth * tetris.blocks[tetris.nextBlockLoopCountForNextBlock].shape[i][0]
            + 3 * tetris.rectangleWidth, tetris.rectangleLength * tetris.blocks[tetris.nextBlockLoopCountForNextBlock].shape[i][1]], i];
    }

    tetris.DisplayNextBlock();
    tetris.rorateCount = 0;

    const intervalId = setInterval(() => {

        tetris.fallingBlockContext.fillStyle = tetris.movingBlockColor;
        const loopFlag = tetris.CheckMoveDown(tetris.movingBlock);
        const finishFlag = tetris.CheckAlreadyExistBlock(tetris.movingBlock);
        if (loopFlag && !finishFlag) {
            tetris.fallingBlockContext.clearRect(0, 0, tetris.fallingBlockCanvasWidth, tetris.fallingBlockCanvasLength);

            for (let i = 0; i < tetris.movingBlock.length; i++) {
                tetris.fallingBlockContext.fillRect(tetris.movingBlock[i][0], tetris.movingBlock[i][1] + tetris.rectangleLength,
                    tetris.rectangleWidth, tetris.rectangleLength);
                tetris.movingBlockField = [[tetris.movingBlock[i][0], tetris.movingBlock[i][1] + tetris.rectangleLength], i];
            }
            tetris.DisplayAllBlocks();
        } else if (!loopFlag && !finishFlag) {
            clearInterval(intervalId);

            //ループが終了し、次に落ちるブロックを落下中のブロックとし、次に落ちるブロックに新たなブロックを追加
            if (tetris.loopCount !== 6) {
                tetris.loopCount++;
            } else {
                tetris.loopCount = 0;
            }

            tetris.allBlocksList.push(
                {
                    shape: tetris.movingBlock.concat(),
                    color: tetris.movingBlockColor
                });

            tetris.CheckRowComplete();

            createCanvasOutline(tetris);
        } else if (!loopFlag && finishFlag) {
            document.querySelector('.overlay').style.display = 'block';
        }

    }, 800);

    //ここでブロックを表示するなどの処理を行えば、バグが発生しなくなる???
    //現状、次のブロック表示→0.8秒待機→落下ブロック表示
    //ここに処理を記載すれば、次のブロック表示→0.8秒待機中に(処理)→落下ブロック表示

}
const tetris = new Tetris();
createCanvasOutline(tetris);

//console.log(blocks[0].shape[3][0]);
//上記の場合、block[blockの中の配列番号].shape[0~3つの配列の中から1つ][0,1のどちらか]

/*Todo
・点数(mustではない)
・次に表示するブロックと実際にブロックが落下する際に時間のずれが生じる(バグ)
・ブロックが落ちる前にキー操作で動かすとブロックの描画位置がおかしくなる(バグ)
*/

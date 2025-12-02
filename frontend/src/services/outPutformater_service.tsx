import katex from "katex";
import 'katex/dist/katex.min.css';


let currenttype: string = '';
let isheading: string = '';
let islist: boolean = false;
let isBlockFormula: boolean = false;
let isBlockCode: boolean = false;
let isinlineFormula: boolean = false;
let isBlockFormulaForMerge: boolean = false;
let checkboolean = false;
let isUnOrdernext = false;
let isUnOrderEndWaiting = false;
let UnOrderListCount: number = 0;
let headinglevel: number = 1;
// let chuckcount = 0;
const murgedchucksarry: string[] = [];
let currentchuck = "";
let finalformatedresult = '';


export const formatOutput = (chuckData: string) => {
    finalformatedresult = "";
    murgetwochuckattime(chuckData); //"**gravity"
    murgedchucksarry.forEach((chuck: string) => {
        // finalformatedresult = headingFormater(chuck);
        // finalformatedresult = horizontaldevider(finalformatedresult);
        // finalformatedresult = unorderlist(finalformatedresult);
        // finalformatedresult = orderlist(finalformatedresult);
        finalformatedresult = formulablock(finalformatedresult);
        // finalformatedresult = codeblock(finalformatedresult);
        // finalformatedresult = boldFormater(finalformatedresult);
        finalformatedresult = chuck;

        murgedchucksarry.pop();
    })
    return Promise.resolve(finalformatedresult);
};

function murgetwochuckattime(chuckData: string) {

    if (chuckData.includes("*")) {
        currentchuck += chuckData;
    }
    else if (chuckData.includes("#")) {
        currentchuck += chuckData;
    }
    else if(chuckData.includes('`')){
        currentchuck += chuckData
    }
    else if (chuckData.includes("-")) {
        currentchuck += chuckData;
    }
    else if (chuckData.includes("\\") || !isBlockFormulaForMerge && checkboolean) {
        currentchuck += chuckData;
        checkboolean = true;
        if (currentchuck.includes("\\]")) {
            isBlockFormulaForMerge = true;
            checkboolean = false;
        }
        if (currentchuck.includes("\\)")) {
            isBlockFormulaForMerge = false;
            checkboolean = false;
        }
    }
    else if (/\d/g.test(chuckData)) {
        currentchuck += chuckData;
    }
    else {
        murgedchucksarry.push(currentchuck + chuckData);
        isBlockFormulaForMerge = false;
        currentchuck = "";
    }

    


    //add every value with currentchuck
}

function headingFormater(chuckData: string): string {
    let headingMatch: RegExpMatchArray | null = null;
    let UnOrderListEnd = "";
    // isheading = '';
    //chuckData ### **2. isheading ###

    while (chuckData.includes("#")) {
        if (!isheading.includes("#")) {
            headingMatch = chuckData.match(/(.*?)\s*(#{1,6})\s*(.+?)\s*$/);
        }
        else{
            headingMatch = chuckData.match(/(.*?)\s*(#{1,6})\s*(.+?)\s*$/);
        }

        if (headingMatch) {

            const prefix = headingMatch[1];                   // "something"
            const level = headingMatch[2].length;             // 3
            const content = headingMatch[3];              // "heading"


            // const level = headingMatch[1].length;
            // const content = headingMatch[2].trim();
            headinglevel = level;
            isheading = "#".repeat(level);

            //checking UorderListBeforeHeading
            islist = true;
            if (isUnOrderEndWaiting) {
                isUnOrderEndWaiting = false;
                UnOrderListEnd = "</li></ul>";
                UnOrderListCount = 0;
            }else{
                UnOrderListEnd = "";
            }

            if (content.includes(":")) {
                const [before, after] = content.split(/:(.+)/); // only first colon
                isheading = '';
                chuckData = `${(prefix || '')}${UnOrderListEnd}<h${level}>${before}</h${level}>${after || ''}`;
            } else {

                chuckData = `${(prefix || '')}${UnOrderListEnd}<h${level}>${content}`;
            }

        }

    }

    while (chuckData.includes(":") && isheading.includes("#")) {
        isheading = '';
        chuckData = chuckData.replace(":", `</h${headinglevel}>`);
    }

    return chuckData;
}

function boldFormater(chuckData: string): string {
    while (chuckData.includes("**")) {
        if (/^\s*\*\*(.*?)\*\*\s*$/.test(chuckData) && !currenttype.includes("**")) {
            chuckData = chuckData.replace(/^\s*\*\*(.*?)\*\*\s*$/, '<b>$1</b>');
        }

        // Open bold
        else if (!currenttype.includes("**")) {
            currenttype = "**";
            chuckData = chuckData.replace("**", '<b>');
        }

        // Close bold
        else if (currenttype.includes("**")) {
            currenttype = '';
            chuckData = chuckData.replace("**", '</b>');
        }
    }

    return chuckData;
}

function horizontaldevider(chuckData: string): string {
    // chuckDat = " - , '-', '- sdf'"

    while ((chuckData).includes('---') && !isBlockCode) {
                chuckData = chuckData.replace('---', '<hr class="horizontalDevider">');
    }


    return chuckData;
}

function unorderlist(chuckData: string): string {
    // chuckDat = " - , '-', '- sdf'"

    while (/(\s+-|\s+-\s+|-\s+)/g.test(chuckData) && !isBlockCode) {
        if (!isUnOrdernext) {
            isUnOrdernext = true
            if (UnOrderListCount == 0) {
                chuckData = chuckData.replace(/\s*-\s*/, "<ul><li>");
            } else {

                chuckData = chuckData.replace(/\s*-\s*/, "<li>");
            }

            UnOrderListCount++;
            // isUnOrderEndWaiting = true;
        }
        else {

            chuckData = chuckData.replace(/\s*-\s*/, "</li><li>");
            isUnOrdernext = false;
            isUnOrderEndWaiting = true;
            UnOrderListCount++;
        }
    }


    return chuckData;
}
function orderlist(chuckData: string): string {
    // chuckDat = " - , '-', '- sdf'"

    while (/\b\d+\.\s/.test(chuckData) && !islist) {
        islist = true;
        if (isUnOrderEndWaiting) {
            isUnOrderEndWaiting = false;
            chuckData = chuckData.replace(/(\b\d+\.\s+.*)/, "</li></ul><div>$1");
            UnOrderListCount = 0;
        } else {
            chuckData = chuckData.replace(/(\b\d+\.\s+.*)/, "<div>$1");
        }
    }
    while (chuckData.includes(":") && islist) {
        chuckData = chuckData.replace(":", "</div>");
        // if (!chuckData.includes(":")) {
        islist = false;
        // }
    }

    return chuckData;
}
function formulablock(chuckData: string): string {
    // chuckDat = " - , '-', '- sdf'"
    while (chuckData.includes('\\[') && !isBlockFormula) {
        chuckData = FormulaMatch(chuckData);

        isBlockFormula = true;
        chuckData = chuckData.replace("\\[", "<span>");
    }
    while (chuckData.includes("\\]") && isBlockFormula) {
        isBlockFormula = false;
        chuckData = chuckData.replace("\\]", "</span>");
    }
    while (chuckData.includes('\\(') && !isinlineFormula) {

        chuckData = FormulaMatch(chuckData);

        isinlineFormula = true;
        chuckData = chuckData.replace("\\(", "<span>");
    }
    while (chuckData.includes("\\)") && isinlineFormula) {
        isinlineFormula = false;
        chuckData = chuckData.replace("\\)", "</span>");
    }

    return chuckData;
}

function codeblock(chuckData: string): string {
    // chuckDat = " - , '-', '- sdf'"
    while (chuckData.includes('```') && !isBlockCode) {
        // chuckData = FormulaMatch(chuckData);

        isBlockCode = true;
        chuckData = chuckData.replace('```', "<pre class='code-card'>");
    }
    while (chuckData.includes('```') && isBlockCode) {
        isBlockCode = false;
        chuckData = chuckData.replace('```', "</pre>");
    }

    return chuckData;
}

const myConvertLatex = (latex: string): string => {
    const fullHTML = katex.renderToString(latex, {
        throwOnError: false,
        output: 'mathml' // Forces pure MathML output only
    });

    const mathOnly = fullHTML.match(/<math[\s\S]*?<\/math>/)?.[0] || '';
    return mathOnly.toString();
}

const FormulaMatch = (chuckData: string): string => {

    const match = chuckData.match(/\\[\\[\\(]\s*(.*?)\s*\\[\]\\)]/);

    if (match) {
        const latextData = myConvertLatex(match[1]);
        chuckData = chuckData.replace(/(\\[\\[\\(])\s*([\s\S]*?)\s*(\\[\]\\)])/, (open, close) => {
            return `${open} ${latextData} ${close}`;
        });
    }

    return chuckData;
}

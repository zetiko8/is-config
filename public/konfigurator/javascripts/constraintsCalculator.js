var logicModule = function () {

    var logicNaming = {
        functors: {
            openingParenthesis: "(",
            closingParenthesis: ")",
            if: "if",
            endif: "endif",
            then: "then",
            and: "and",
            or: "or",
            not: "not",
            conjunction: "€",
        },

        comparators: {
            equals: {
                chars: ["=",],
                name: "equals"
            },
            notEquals: {
                chars: [ "<>"],
                name: "notEquals"
            },
        },

        space: "|",
        elementDelimeter: "'",
        elementOpeningParenthesis: "{",
        elementClosingParenthesis: "}",
        propertyOpeningParenthesis: "[",
        propertyClosingParenthesis: "]",

        isFunctor: function (element) {      // vrne true, če je vnosni param = logicalNaming.functors
            for (var key in this.functors) {
                if (element == this.functors[key]) { return true; }
            }
            return false;
        },
        isComparator: function (element) {   // vrne ime komparatorja, če je vnosi param = comparator, sicer vrne null
            for (var key in this.comparators) {
                for (var i = 0; i < this.comparators[key].chars.length; i++) {
                    if (element == this.comparators[key].chars[i]) {
                        return key;
                    }
                }
            }
            return null;
        },
        isExpected: function (element) {
            var expectendTokens = [
                this.elementClosingParenthesis,
                this.elementOpeningParenthesis,
                this.propertyClosingParenthesis,
                this.propertyOpeningParenthesis,
                this.elementDelimeter,
                ",",
                ""
            ]
            for (var i = 0; i < expectendTokens.length; i++) {
                if (element == expectendTokens[i]) { return true; }
            }
            return false;
        }
    }

    function getTruth(proposition, truths) {

        // because of references conflicts
        var propositionClone = jQuery.extend(true, {}, proposition);
        var stmnt = propositionClone.stmnt;

        for (var i = 0; i < stmnt.length; i++) {

            if (stmnt[i].hasOwnProperty('comparator')) {
                stmnt[i] = resolveNode(stmnt[i], truths);
            }

            if (stmnt[0] != null && stmnt[0] === logicNaming.openingParenthesis) {
                stmnt[i] = getTruth(stmnt[i]);
            }

        }

        stmnt = decideNot(stmnt);
        stmnt = decideAnd(stmnt);
        stmnt = decideOr(stmnt);

        for (var i = 0; i < stmnt.length; i++) {
            if (stmnt[i] == true) { return true; }
        }
        return false;

        function resolveNode(node, truths) {

            // TO DO !! test
            for (var i = 0; i < truths.length; i++) {
                if (node.property == truths[i].property) {
                    var x = checkMatch(node.options, truths[i].option);
                    if (node.comparator == logicNaming.comparators.equals.name)   // če je komparator "=" - equals
                    { if (x) return true; }
                    if (node.comparator == logicNaming.comparators.notEquals.name)   // če je komparator "<>" - notEquals
                    { if (!x) return true; }
                }
            }
            return false;
        }

        function checkMatch(options, truth) {
            for (var i = 0; i < options.length; i++) {
                if (options[i] == truth) {
                    return true;
                }
            }
            return false;
        }

        function decideNot(stmnt) {
            for (var i = 0; i < stmnt.length; i++) {
                if (stmnt[i] == logicNaming.functors.not) {
                    stmnt[i + 1] = !stmnt[i + 1];
                    stmnt.splice(i, 1);
                }
            }
            return stmnt;
        }

        function decideAnd(stmnt) {
            var newStmnt;
            while (stmnt != null) {
                newStmnt = stmnt;
                stmnt = getResultAnd(stmnt);
            }
            return newStmnt;
        }

        function getResultAnd(stmnt) {
            for (var i = 0; i < stmnt.length; i++) {
                if (stmnt[i] == logicNaming.functors.and) {
                    var result = stmnt[i - 1] && stmnt[i + 1];
                    var arr1 = chopArr(stmnt, 0, i - 2);
                    var arr2 = chopArr(stmnt, i + 2, stmnt.length - 1);
                    stmnt = arr1.push(result);
                    stmnt = arr1.concat(arr2);
                    return stmnt;
                }
            }
            return null;
        }

        function decideOr(stmnt) {
            var newStmnt;
            while (stmnt != null) {
                newStmnt = stmnt;
                stmnt = getResultOr(stmnt);
            }
            return newStmnt;
        }

        function getResultOr(stmnt) {
            for (var i = 0; i < stmnt.length; i++) {
                if (stmnt[i] == logicNaming.functors.or) {
                    var result = stmnt[i - 1] || stmnt[i + 1];
                    var arr1 = chopArr(stmnt, 0, i - 2);
                    var arr2 = chopArr(stmnt, i + 2, stmnt.length - 1);
                    stmnt = arr1.push(result);
                    stmnt = arr1.concat(arr2);
                    return stmnt;
                }
            }
            return null;
        }

        function chopArr(array, startIndex, endIndex) {
            var arr = [];
            for (var i = startIndex; i < endIndex + 1; i++) {
                arr.push(array[i]);
            }
            return arr;
        }
    }

    return {
        getTruth: getTruth
    }
}
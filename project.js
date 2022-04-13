function main() {
    var updateBars;
    //-------------------------------bar graph-------------------------------
    var fileName = "nutrients_csvfile.csv";
    var nutritionFields = ["Calories", "Protein", "Fat", "SaturatedFat", "Fiber", "Carbs"];
    var categories = ["Food", "Breads, cereals, fastfood,grains", "Dairy products", "Desserts, sweets", "Drinks,Alcohol, Beverages", "Fats, Oils, Shortenings", "Fish, Seafood", "Fruits A-F", "Fruits G-P", "Fruits R-Z", "Jams, Jellies", "Meat, Poultry", "Seeds and Nuts", "Soups", "Vegetables A-E", "Vegetables F-P", "Vegetables R-Z"];

    d3.csv(fileName).then(function (data) {
        var foodMap = {};
        data.forEach(function (d) {

            var cereal = d.Food;
            foodMap[cereal] = [];

            nutritionFields.forEach(function (field) {
                foodMap[cereal].push(+d[field]);
            });
            
        });
        var margin = { top: 30, right: 50, bottom: 30, left: 40 },
            width = 450 - margin.left - margin.right,
            height = 250 - margin.top - margin.bottom;

        var xScale = d3.scaleBand()
            .domain(nutritionFields)
            .range([0, width])
            .padding(0.2);

        var yScale = d3.scaleLinear()
            .range([height, 0], 0.1);

        var svg = d3.select("body")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate( 715,50)");

        var xAxis = d3.axisBottom(xScale);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        var yAxis = d3.axisLeft(yScale);

        var yAxisHandleForUpdate = svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);

        yAxisHandleForUpdate.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Value");

        updateBars = function (fdata) {
            if (!categories.includes(fdata)) {
                d3.select('#text1').remove();
                svg.append('text')
                    .attr('x', 0)
                    .attr('y', -10)
                    .attr('id', 'text1')
                    .attr('fill', '#55364e')
                    .attr('font-family', 'sans-serif')
                    .attr('font-size', 12)
                    .attr('font-weight', 'bold')
                    .text('Nutrient content in ' + fdata + ' (per Gram)');
            }

            data = foodMap[fdata];
            yScale.domain(d3.extent(data));
            yAxisHandleForUpdate.call(yAxis);

            var bars = svg.selectAll(".bar").data(data);

            var tip = d3.select("body").append("g")
                .style("position", "absolute")
                .attr("class", "toolTip")
                .style("opacity", 0);

            bars.enter()
                .append("rect")

                .attr("class", "bar")
                .attr("x", function (d, i) { return xScale(nutritionFields[i]); })
                .attr("width", xScale.bandwidth() * 1)
                .attr("y", function (d, i) { return yScale(d); })
                .attr("height", function (d, i) { return height - yScale(d) })
                .on("mouseover", function (event, d) {
                    tip.transition()
                        .duration(150)
                        .style("opacity", .9);
                    tip.html(d)
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px")
                })
                .on("mouseout", function (d) {
                    tip.transition()
                        .duration(500)
                        .style("opacity", 0)
                });

            bars
                .transition().duration(250)
                .attr("y", function (d, i) { return yScale(d); })
                .attr("height", function (d, i) { return height - yScale(d); });

            bars.exit().remove();
        };

        var food = Object.keys(foodMap).sort();
        updateBars(food[0]);

    });

    //-------------------------------Stacked bar graph-------------------------------
    d3.csv(fileName).then(function (data) {

        topCalorieData = data.sort(function (a, b) {
            return -a.Calories - -b.Calories
        }).slice(0, 10);
        
        topProteinData = data.sort(function (a, b) {
            return -a.Protein - -b.Protein
        }).slice(0, 10);

        topFatData = data.sort(function (a, b) {
            return -a.Fat - -b.Fat
        }).slice(0, 10);

        topSatFatData = data.sort(function (a, b) {
            return -a.SaturatedFat - -b.SaturatedFat
        }).slice(0, 10);

        topFibreData = data.sort(function (a, b) {
            return -a.Fiber - -b.Fiber
        }).slice(0, 10);

        topCarbsData = data.sort(function (a, b) {
            return -a.Carbs - -b.Carbs
        }).slice(0, 10);

        var subgroups = data.columns.slice(3, 9)
        var groups = d3.map(topCalorieData, function (d) { return (d.Food) });
        var pGroups = d3.map(topProteinData, function (d) { return (d.Food) });
        var fGroups = d3.map(topFatData, function (d) { return (d.Food) });
        var sfGroups = d3.map(topSatFatData, function (d) { return (d.Food) });
        var fiGroups = d3.map(topFibreData, function (d) { return (d.Food) });
        var cGroups = d3.map(topCarbsData, function (d) { return (d.Food) });
        makeCalorieStack(topCalorieData, subgroups, groups)
        makeProteinStack(topProteinData, subgroups, pGroups)
        makeFatStack(topFatData, subgroups, fGroups)
        makeSatFatStack(topSatFatData, subgroups, sfGroups)
        makeFibreStack(topFibreData, subgroups, fiGroups)
        makeCarbsStack(topCarbsData, subgroups, cGroups)

        d3.select('#Proteinstack').style("visibility", "hidden")
        d3.select('#Fatstack').style("visibility", "hidden")
        d3.select('#SatFatstack').style("visibility", "hidden")
        d3.select('#Fibrestack').style("visibility", "hidden")
        d3.select('#Carbsstack').style("visibility", "hidden")
    });

    function makeCarbsStack(topCarbsData, subgroups, cGroups) {
        var margin = { top: 20, right: 120, bottom: 20, left: 70 },
            width = 600 - margin.right - margin.left,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("position", "absolute")
            .append("g")
            .attr("id", "Carbsstack")
            .attr("transform", "translate(715,300)");
        var tip = d3.select("body").append("g")
            .style("position", "absolute")
            .attr("class", "toolTip")
            .style("opacity", 0);

        var x = d3.scaleBand()
            .domain(cGroups)
            .range([0, width])
            .padding([0.2])

        var y = d3.scaleLinear()
            .domain([0, 12])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        var stackedData = d3.stack()
            .keys(subgroups)
            (topCarbsData)

        var mouseover = function (event, d) {
            var subgroupName = d3.select(this.parentNode).datum().key;
            subgroupValue = d.data[subgroupName];
            // Reduce opacity of all rect to 0.2
            d3.selectAll(".myRect").style("opacity", 0.2)
            // Highlight all rects of this subgroup with opacity 0.8.
            d3.selectAll("." + subgroupName)
                .style("opacity", 1);
            tip.transition()
                .duration(150)
                .style("opacity", .9);
            tip.html(subgroupValue)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        var mouseleave = function (d) {
            // Back to normal opacity: 0.8
            d3.selectAll(".myRect")
                .style("opacity", 0.8)
            tip.transition()
                .duration(500)
                .style("opacity", 0)
        }

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function (d) { return color(d.key); })
            .attr("class", function (d) { return "myRect " + d.key })
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.Food); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")

            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .call(wrap, 65);
    }
    function makeFibreStack(topFibreData, subgroups, fiGroups) {
        var margin = { top: 20, right: 120, bottom: 20, left: 70 },
            width = 600 - margin.right - margin.left,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("position", "absolute")
            .append("g")
            .attr("id", "Fibrestack")
            .attr("transform", "translate(715,300)");
        var tip = d3.select("body").append("g")
            .style("position", "absolute")
            .attr("class", "toolTip")
            .style("opacity", 0);
        var x = d3.scaleBand()
            .domain(fiGroups)
            .range([0, width])
            .padding([0.2])

        var y = d3.scaleLinear()
            .domain([0, 12])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        var stackedData = d3.stack()
            .keys(subgroups)
            (topFibreData)

        var mouseover = function (event, d) {
            var subgroupName = d3.select(this.parentNode).datum().key; 
            var subgroupValue = d.data[subgroupName];
            d3.selectAll(".myRect").style("opacity", 0.2)
            d3.selectAll("." + subgroupName)
                .style("opacity", 1);
            tip.transition()
                .duration(150)
                .style("opacity", .9);
            tip.html(subgroupValue)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        var mouseleave = function (d) {
            d3.selectAll(".myRect")
                .style("opacity", 0.8)
            tip.transition()
                .duration(500)
                .style("opacity", 0)
        }

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function (d) { return color(d.key); })
            .attr("class", function (d) { return "myRect " + d.key })
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.Food); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .call(wrap, 65);
    }

    function makeSatFatStack(topSatFatData, subgroups, sfGroups) {
        var margin = { top: 20, right: 120, bottom: 20, left: 70 },
            width = 600 - margin.right - margin.left,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("position", "absolute")
            .append("g")
            .attr("id", "SatFatstack")
            .attr("transform", "translate(715,300)");

        var tip = d3.select("body").append("g")
            .style("position", "absolute")
            .attr("class", "toolTip")
            .style("opacity", 0);

        var x = d3.scaleBand()
            .domain(sfGroups)
            .range([0, width])
            .padding([0.2])

        var y = d3.scaleLinear()
            .domain([0, 12])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        var stackedData = d3.stack()
            .keys(subgroups)
            (topSatFatData)

        var mouseover = function (event, d) {
            var subgroupName = d3.select(this.parentNode).datum().key;
            var subgroupValue = d.data[subgroupName];
            d3.selectAll(".myRect").style("opacity", 0.2)
            d3.selectAll("." + subgroupName)
                .style("opacity", 1)
            tip.transition()
                .duration(150)
                .style("opacity", .9);
            tip.html(subgroupValue)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        var mouseleave = function (d) {
            d3.selectAll(".myRect")
                .style("opacity", 0.8)
            tip.transition()
                .duration(500)
                .style("opacity", 0)
        }

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function (d) { return color(d.key); })
            .attr("class", function (d) { return "myRect " + d.key }) 
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.Food); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .call(wrap, 65);
    }

    function makeFatStack(topFatData, subgroups, fGroups) {
        var margin = { top: 20, right: 120, bottom: 20, left: 70 },
            width = 600 - margin.right - margin.left,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("position", "absolute")
            .append("g")
            .attr("id", "Fatstack")
            .attr("transform", "translate(715,300)");

        var tip = d3.select("body").append("g")
            .style("position", "absolute")
            .attr("class", "toolTip")
            .style("opacity", 0);
        var x = d3.scaleBand()
            .domain(fGroups)
            .range([0, width])
            .padding([0.2])

        var y = d3.scaleLinear()
            .domain([0, 12])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        var stackedData = d3.stack()
            .keys(subgroups)
            (topFatData)

        var mouseover = function (event, d) {
            var subgroupName = d3.select(this.parentNode).datum().key; 
            var subgroupValue = d.data[subgroupName];
            d3.selectAll(".myRect").style("opacity", 0.2)
            d3.selectAll("." + subgroupName)
                .style("opacity", 1)
            tip.transition()
                .duration(150)
                .style("opacity", .9);
            tip.html(subgroupValue)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        var mouseleave = function (d) {
            d3.selectAll(".myRect")
                .style("opacity", 0.8)
            tip.transition()
                .duration(500)
                .style("opacity", 0)
        }

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function (d) { return color(d.key); })
            .attr("class", function (d) { return "myRect " + d.key }) 
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.Food); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .call(wrap, 65);
    }

    function makeProteinStack(topProteinData, subgroups, pGroups) {
        var margin = { top: 20, right: 120, bottom: 20, left: 70 },
            width = 600 - margin.right - margin.left,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("position", "absolute")
            .append("g")
            .attr("id", "Proteinstack")
            .attr("transform", "translate(715,300)");

        var tip = d3.select("body").append("g")
            .style("position", "absolute")
            .attr("class", "toolTip")
            .style("opacity", 0);
        var x = d3.scaleBand()
            .domain(pGroups)
            .range([0, width])
            .padding([0.2])

        var y = d3.scaleLinear()
            .domain([0, 12])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        var stackedData = d3.stack()
            .keys(subgroups)
            (topProteinData)

        var mouseover = function (event, d) {
            var subgroupName = d3.select(this.parentNode).datum().key; 
            var subgroupValue = d.data[subgroupName];
            d3.selectAll(".myRect").style("opacity", 0.2)
            d3.selectAll("." + subgroupName)
                .style("opacity", 1)
            tip.transition()
                .duration(150)
                .style("opacity", .9);
            tip.html(subgroupValue)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        var mouseleave = function (d) {
            d3.selectAll(".myRect")
                .style("opacity", 0.8)
            tip.transition()
                .duration(500)
                .style("opacity", 0)
        }

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function (d) { return color(d.key); })
            .attr("class", function (d) { return "myRect " + d.key }) 
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.Food); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .call(wrap, 65);
    }

    function makeCalorieStack(topCalorieData, subgroups, groups) {
        var margin = { top: 20, right: 120, bottom: 20, left: 70 },
            width = 600 - margin.right - margin.left,
            height = 250 - margin.top - margin.bottom;

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .attr("position", "absolute")
            .append("g")
            .attr("id", "Caloriestack")
            .attr("transform", "translate(715,300)");
        var tip = d3.select("body").append("g")
            .style("position", "absolute")
            .attr("class", "toolTip")
            .style("opacity", 0);
        var x = d3.scaleBand()
            .domain(groups)
            .range([0, width])
            .padding([0.2])

        var y = d3.scaleLinear()
            .domain([0, 12])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(d3.schemeSet2);

        var stackedData = d3.stack()
            .keys(subgroups)
            (topCalorieData)
        var mouseover = function (event, d) {
            var subgroupName = d3.select(this.parentNode).datum().key; 
            var subgroupValue = d.data[subgroupName];
            d3.selectAll(".myRect").style("opacity", 0.2)
            d3.selectAll("." + subgroupName)
                .style("opacity", 1)
            tip.transition()
                .duration(150)
                .style("opacity", .9);
            tip.html(subgroupValue)
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY - 28) + "px")
        }
        var mouseleave = function (d) {
            d3.selectAll(".myRect")
                .style("opacity", 0.8)
            tip.transition()
                .duration(500)
                .style("opacity", 0)
        }

        svg.append("g")
            .selectAll("g")
            .data(stackedData)
            .enter().append("g")
            .attr("fill", function (d) { return color(d.key); })
            .attr("class", function (d) { return "myRect " + d.key }) 
            .selectAll("rect")
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.Food); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
            .attr("stroke", "grey")
            .on("mouseover", mouseover)
            .on("mouseleave", mouseleave);

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("dy", ".35em")
            .attr("transform", "rotate(90)")
            .style("text-anchor", "start")
            .call(wrap, 65);
    }

    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().trimStart().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")),
                lineHeight = 1.1, // ems
                tspan = text.text(null).append("tspan").attr("x", function (d) { return d.children || d._children ? -10 : 10; }).attr("y", y).attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                var textWidth = tspan.node().getComputedTextLength();
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    ++lineNumber;
                    tspan = text.append("tspan").attr("x", function (d) { return d.children || d._children ? -10 : 10; }).attr("y", 0).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
                }
            }
        });
    }

    //-------------------------------tree graph-------------------------------

    d3.json("category.json").then(function (treeData) {

        var margin = { top: 40, right: 120, bottom: 20, left: 120 },
            width = 1333 - margin.right - margin.left,
            height = 605 - margin.top - margin.bottom;

        var i = 0,
            duration = 750,
            root;

        var treemap = d3.tree().size([height, width]);

        var svg = d3.select("body").selectAll("svg")
            .attr("width", width + margin.right + margin.left)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text")
            .attr('x', -40)
            .attr('y', -20)
            .attr('fill', 'darkblue')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 24)
            .attr('font-weight', "bold")
            .text('NutritionData');
        svg.append('rect')
            .attr("width", 460)
            .attr("height", 240)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", "1px")
            .attr("x", 553)
            .attr("y", -15);
        svg.append('rect')
            .attr("width", 460)
            .attr("height", 302)
            .attr("fill", "none")
            .attr("stroke", "grey")
            .attr("stroke-width", "1px")
            .attr("x", 553)
            .attr("y", 250);
        svg.append("text")
            .attr('x', 6)
            .attr('y', -8)
            .attr('fill', 'darkgrey')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 12)
            .attr('font-weight', "bold")
            .text('know what you eat');

        svg.append("text")
            .attr('x', 600)
            .attr('y', 265)
            .attr("id", "label")
            .attr('fill', 'darkblue')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 12)
            .attr('font-weight', "bold")
            .text('Top 10 food for Calories (per Gram)');
        // code for tab functionality
        svg.append('rect')
            .attr("width", 68)
            .attr("height", 20)
            .attr("fill", "none")
            .attr("id", "calbutton")
            .attr("stroke", "#80cab3")
            .attr("stroke-width", "1px")
            .attr("x", 553)
            .attr("y", 230)
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select(this).attr("fill") == "#5bffcc61") {
                    d3.select(this).attr("fill", "#5bffcc61")
                }
                else {
                    d3.select(this).attr("fill", "#5bffcc5e")
                }
            })
            .on("mouseout", function () {
                if (d3.select(this).attr("fill") == "#5bffcc61") {
                    d3.select(this).attr("fill", "#5bffcc61")
                }
                else {
                    d3.select(this).attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Caloriestack').style("visibility", "visible");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select(this).attr("fill", "#5bffcc61");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");


            });
        d3.select("#calbutton").attr("fill", "#5bffcc61");
        svg.append("text")
            .attr('x', 563)
            .attr('y', 245)
            .attr('fill', '#80cab3')
            .attr('position', 'absolute')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text('Calorie')
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select("#calbutton").attr("fill") == "#5bffcc61") {
                    d3.select("#calbutton").attr("fill", "#5bffcc61")
                }
                else {
                    d3.select("#calbutton").attr("fill", "#5bffcc5e")
                }
            })
            .on("mouseout", function () {
                if (d3.select("#calbutton").attr("fill") == "#5bffcc61") {
                    d3.select("#calbutton").attr("fill", "#5bffcc61")
                }
                else {
                    d3.select("#calbutton").attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Caloriestack').style("visibility", "visible");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "#5bffcc61");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
                topText("Calorie")
            })


        svg.append('rect')
            .attr("width", 68)
            .attr("height", 20)
            .attr("fill", "none")
            .attr("stroke", "#fc8d62")
            .attr("stroke-width", "1px")
            .attr("id", "probutton")
            .attr("x", 623)
            .attr("y", 230)
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select(this).attr("fill") == "#ff6f3861") {
                    d3.select(this).attr("fill", "#ff6f3861")
                }
                else {
                    d3.select(this).attr("fill", "#ff6f385e")
                }
            })
            .on("mouseout", function () {
                if (d3.select(this).attr("fill") == "#ff6f3861") {
                    d3.select(this).attr("fill", "#ff6f3861")
                }
                else {
                    d3.select(this).attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Proteinstack').style("visibility", "visible");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select(this).attr("fill", "#ff6f3861");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
            });

        svg.append("text")
            .attr('x', 633)
            .attr('y', 245)
            .attr('fill', '#fc8d62')
            .attr('position', 'absolute')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text('Protein')
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select("#probutton").attr("fill") == "#ff6f3861") {
                    d3.select("#probutton").attr("fill", "#ff6f3861")
                }
                else {
                    d3.select("#probutton").attr("fill", "#ff6f385e")
                }
            })
            .on("mouseout", function () {
                if (d3.select("#probutton").attr("fill") == "#ff6f3861") {
                    d3.select("#probutton").attr("fill", "#ff6f3861")
                }
                else {
                    d3.select("#probutton").attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Proteinstack').style("visibility", "visible");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "#ff6f3861");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
                topText("Protein")
            });

        svg.append('rect')
            .attr("width", 68)
            .attr("height", 20)
            .attr("fill", "none")
            .attr("stroke", "#8da0cb")
            .attr("stroke-width", "1px")
            .attr("id", "fatbutton")
            .attr("x", 693)
            .attr("y", 230)
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select(this).attr("fill") == "#4c83ff61") {
                    d3.select(this).attr("fill", "#4c83ff61")
                }
                else {
                    d3.select(this).attr("fill", "#4d82ff5e")
                }
            })
            .on("mouseout", function () {
                if (d3.select(this).attr("fill") == "#4c83ff61") {
                    d3.select(this).attr("fill", "#4c83ff61")
                }
                else {
                    d3.select(this).attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "visible");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select(this).attr("fill", "#4c83ff61");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
            });

        svg.append("text")
            .attr('x', 715)
            .attr('y', 245)
            .attr('fill', '#8da0cb')
            .attr('position', 'absolute')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text('Fat')
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select("#fatbutton").attr("fill") == "#4c83ff61") {
                    d3.select("#fatbutton").attr("fill", "#4c83ff61")
                }
                else {
                    d3.select("#fatbutton").attr("fill", "#4d82ff5e")
                }
            })
            .on("mouseout", function () {
                if (d3.select("#fatbutton").attr("fill") == "#4c83ff61") {
                    d3.select("#fatbutton").attr("fill", "#4c83ff61")
                }
                else {
                    d3.select("#fatbutton").attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "visible");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "#4c83ff61");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
                topText("Fat")
            })

        svg.append('rect')
            .attr("width", 68)
            .attr("height", 20)
            .attr("fill", "none")
            .attr("stroke", "#e78ac3")
            .attr("stroke-width", "1px")
            .attr("id", "satfatbutton")
            .attr("x", 763)
            .attr("y", 230)
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select(this).attr("fill") == "#ff76ca61") {
                    d3.select(this).attr("fill", "#ff76ca61")
                }
                else {
                    d3.select(this).attr("fill", "#ff76ca5e")
                }
            })
            .on("mouseout", function () {
                if (d3.select(this).attr("fill") == "#ff76ca61") {
                    d3.select(this).attr("fill", "#ff76ca61")
                }
                else {
                    d3.select(this).attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "visible");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select(this).attr("fill", "#ff76ca61");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
            });

        svg.append("text")
            .attr('x', 771)
            .attr('y', 245)
            .attr('fill', '#e78ac3')
            .attr('position', 'absolute')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text('Sat. Fat')
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select("#satfatbutton").attr("fill") == "#ff76ca61") {
                    d3.select("#satfatbutton").attr("fill", "#ff76ca61")
                }
                else {
                    d3.select("#satfatbutton").attr("fill", "#ff76ca5e")
                }
            })
            .on("mouseout", function () {
                if (d3.select("#satfatbutton").attr("fill") == "#ff76ca61") {
                    d3.select("#satfatbutton").attr("fill", "#ff76ca61")
                }
                else {
                    d3.select("#satfatbutton").attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "visible");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "#ff76ca61");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "none");
                topText("Saturated Fat")
            })

        svg.append('rect')
            .attr("width", 68)
            .attr("height", 20)
            .attr("fill", "none")
            .attr("stroke", "#a6d854")
            .attr("stroke-width", "1px")
            .attr("id", "fibrebutton")
            .attr("x", 833)
            .attr("y", 230)
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select(this).attr("fill") == "#9eff0061") {
                    d3.select(this).attr("fill", "#9eff0061")
                }
                else {
                    d3.select(this).attr("fill", "#9eff005e")
                }
            })
            .on("mouseout", function () {
                if (d3.select(this).attr("fill") == "#9eff0061") {
                    d3.select(this).attr("fill", "#9eff0061")
                }
                else {
                    d3.select(this).attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "visible");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select(this).attr("fill", "#9eff0061");
                d3.select("#carbsbutton").attr("fill", "none");
            });

        svg.append("text")
            .attr('x', 850)
            .attr('y', 245)
            .attr('fill', '#a6d854')
            .attr('position', 'absolute')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text('Fibre')
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select("#fibrebutton").attr("fill") == "#9eff0061") {
                    d3.select("#fibrebutton").attr("fill", "#9eff0061")
                }
                else {
                    d3.select("#fibrebutton").attr("fill", "#9eff005e")
                }
            })
            .on("mouseout", function () {
                if (d3.select("#fibrebutton").attr("fill") == "#9eff0061") {
                    d3.select("#fibrebutton").attr("fill", "#9eff0061")
                }
                else {
                    d3.select("#fibrebutton").attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "visible");
                d3.select('#Carbsstack').style("visibility", "hidden");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "#9eff0061");
                d3.select("#carbsbutton").attr("fill", "none");
                topText("Fiber")

            })

        svg.append('rect')
            .attr("width", 68)
            .attr("height", 20)
            .attr("fill", "none")
            .attr("stroke", "#ffd92f")
            .attr("stroke-width", "1px")
            .attr("id", "carbsbutton")
            .attr("x", 903)
            .attr("y", 230)
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select(this).attr("fill") == "#ffe05761") {
                    d3.select(this).attr("fill", "#ffe05761")
                }
                else {
                    d3.select(this).attr("fill", "#ffe0575e")
                }
            })
            .on("mouseout", function () {
                if (d3.select(this).attr("fill") == "#ffe05761") {
                    d3.select(this).attr("fill", "#ffe05761")
                }
                else {
                    d3.select(this).attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "visible");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select(this).attr("fill", "#ffe05761");
            })

        svg.append("text")
            .attr('x', 917)
            .attr('y', 245)
            .attr('fill', '#ffd92f')
            .attr('position', 'absolute')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .text('Carbs')
            .attr("cursor", "pointer")
            .on("mouseover", function () {
                if (d3.select("#carbsbutton").attr("fill") == "#ffe05761") {
                    d3.select("#carbsbutton").attr("fill", "#ffe05761")
                }
                else {
                    d3.select("#carbsbutton").attr("fill", "#ffe0575e")
                }
            })
            .on("mouseout", function () {
                if (d3.select("#carbsbutton").attr("fill") == "#ffe05761") {
                    d3.select("#carbsbutton").attr("fill", "#ffe05761")
                }
                else {
                    d3.select("#carbsbutton").attr("fill", "none")
                }
            })
            .on("click", function () {
                d3.select('#Fatstack').style("visibility", "hidden");
                d3.select('#Proteinstack').style("visibility", "hidden");
                d3.select('#Caloriestack').style("visibility", "hidden");
                d3.select('#SatFatstack').style("visibility", "hidden");
                d3.select('#Fibrestack').style("visibility", "hidden");
                d3.select('#Carbsstack').style("visibility", "visible");
                d3.select("#calbutton").attr("fill", "none");
                d3.select("#probutton").attr("fill", "none");
                d3.select("#fatbutton").attr("fill", "none");
                d3.select("#satfatbutton").attr("fill", "none");
                d3.select("#fibrebutton").attr("fill", "none");
                d3.select("#carbsbutton").attr("fill", "#ffe05761");
                topText("Carbs")
            })

        function topText(name) {
            d3.select("#label").remove();
            svg.append("text")
                .attr('x', 600)
                .attr('y', 265)
                .attr("id", "label")
                .attr('fill', 'darkblue')
                .attr('font-family', 'sans-serif')
                .attr('font-size', 12)
                .attr('font-weight', "bold")
                .text('Top 10 food for ' + name + ' (per Gram)');

        }

        root = d3.hierarchy(treeData, function (d) {
            return d.children;
        });
        root.x0 = height / 2;
        root.y0 = 0;

        function collapse(d) {
            if (d.children) {
                d._children = d.children;
                d._children.forEach(collapse);
                d.children = null;
            }
        }

        root.children.forEach(collapse);
        update(root);

        function update(source) {

            var food = treemap(root);

            var nodes = food.descendants(),
                links = food.descendants().slice(1);

            nodes.forEach(function (d) { d.y = d.depth * 180 });

            // ****************** Nodes section ***************************

            // Update the nodes...
            var node = svg.selectAll('g.node')
                .data(nodes, function (d) { return d.id || (d.id = ++i); });

            // Enter any new modes at the parent's previous position.
            var nodeEnter = node.enter().append('g')
                .attr('class', 'node')
                .attr("font-size", "10px")
                .attr("transform", function (d) {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on('click', click)
                .on('mouseover', function (event, d) { d3.select(this).attr("fill", "#55364e").select("text").attr("font-size", "12px").attr("font-weight", "bold"); updateBars(d.data.name); })
                .on('mouseout', function (event, d) { d3.select(this).attr("fill", "#0b032d").select("text").attr("font-size", "10px").attr("font-weight", "none") });

            // Add Circle for the nodes
            nodeEnter.append('circle')
                .attr('class', 'node')
                .attr('r', 1e-6)
                .style("fill", function (d) {
                    return d._children ? "#843b62" : "#fff";
                });

            // Add labels for the nodes
            nodeEnter.append('text')
                .attr("dy", ".35em")
                .attr("font-size", "10px")
                .attr("fill", "#0b032d")
                .attr("x", function (d) {
                    return d.children || d._children ? -13 : 13;
                })
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) { return d.data.name; })
                .on('mouseover', function () {
                    d3.select(this).attr("fill", "#55364e").attr("font-size", "12px").attr("font-weight", "bold");

                })
                .on('mouseout', function () { d3.select(this).attr("fill", "#0b032d").attr("font-size", "10px").attr("font-weight", "none") });

            // UPDATE
            var nodeUpdate = nodeEnter.merge(node);

            // Transition to the proper position for the node
            nodeUpdate.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                })
                .attr("fill-opacity", 1)
                .attr("stroke-opacity", 1);

            // Update the node attributes and style
            nodeUpdate.select('circle.node')
                .attr('r', 7)
                .style("fill", function (d) {
                    return d._children ? "#ad7fb4" : "#fff";
                })
                .attr('cursor', 'pointer')
                .on('mouseover', function () { d3.select(this).attr("r", "8") })
                .on('mouseout', function () { d3.select(this).attr("r", "7") })

            // Remove any exiting nodes
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            // On exit reduce the node circles size to 0
            nodeExit.select('circle')
                .attr('r', 1e-6);

            // On exit reduce the opacity of text labels
            nodeExit.select('text')
                .style('fill-opacity', 1e-6);

            // ****************** links section ***************************

            // Update the links...
            var link = svg.selectAll('path.link')
                .data(links, function (d) { return d.id; });

            // Enter any new links at the parent's previous position.
            var linkEnter = link.enter().insert('path', "g")
                .attr("class", "link")
                .attr('d', function (d) {
                    var o = { x: source.x0, y: source.y0 }
                    return diagonal(o, o)
                });

            // UPDATE
            var linkUpdate = linkEnter.merge(link);

            // Transition back to the parent element position
            linkUpdate.transition()
                .duration(duration)
                .attr('d', function (d) { return diagonal(d, d.parent) });

            // Remove any exiting links
            var linkExit = link.exit().transition()
                .duration(duration)
                .attr('d', function (d) {
                    var o = { x: source.x, y: source.y }
                    return diagonal(o, o)
                })
                .remove();

            // Store the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });

            // Creates a curved (diagonal) path from parent to the child nodes
            function diagonal(s, d) {

                path = `M ${s.y} ${s.x}
                  C ${(s.y + d.y) / 2} ${s.x},
                    ${(s.y + d.y) / 2} ${d.x},
                    ${d.y} ${d.x}`

                return path
            }

            // Toggle children on click.
            function click(event, d) {

                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                update(d);

            }
        }

    });

}

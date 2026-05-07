// --- Data & Tooltips ---
const eggCapitalItems = [
  { id: "e-cap-1", name: "Coop & Hardware", tooltip: "Costs vary widely. Use scrap wood/upcycled materials ($0-$50), build a basic DIY kit ($300), or buy a premium kit ($1,000+)." },
  { id: "e-cap-2", name: "Fencing/Tractor", tooltip: "Basic wire and T-posts are cheap. Movable electric netting with a solar charger can cost $150-$300+." },
  { id: "e-cap-3", name: "Feeders & Waterers", tooltip: "DIY buckets are cheap ($10). Heavy-duty galvanized or automatic systems cost more ($50-$100+)." },
  { id: "e-cap-4", name: "Feed Storage (Bins)", tooltip: "Crucial for preventing rodents/moisture. A simple metal trash can ($30) or bulk bins ($150+)." },
];

const eggOperatingItems = [
  { id: "e-op-1", name: "Hens/Chicks Purchased" },
  { id: "e-op-2", name: "Feed Bags (50lbs)" },
  { id: "e-op-3", name: "Bedding/Pine Shavings" },
  { id: "e-op-4", name: "Supplements (Grit/Oyster)" },
];

const meatCapitalItems = [
  { id: "m-cap-1", name: "Brooder Setup", tooltip: "Cardboard ring & heat lamp ($20) vs. premium brooder plates and draft-free enclosures ($100+)." },
  { id: "m-cap-2", name: "Chicken Tractor", tooltip: "A PVC and chicken wire hoop house ($100) vs. heavy wood and hardware cloth Suscovich-style tractors ($300+)." },
  { id: "m-cap-3", name: "Feeders & Waterers", tooltip: "Meat birds eat/drink a lot. Long trough feeders and bell waterers can run $50-$150." },
  { id: "m-cap-4", name: "Processing Equipment", tooltip: "Knives and a traffic cone ($30) vs. buying a plucker and scalder ($500+). Renting equipment is a great option!" },
  { id: "m-cap-5", name: "Feed Storage (Bins)", tooltip: "Crucial for preventing rodents/moisture. A simple metal trash can ($30) or bulk bins ($150+)." },
];

const meatOperatingItems = [
  { id: "m-op-1", name: "Meat Chicks Purchased" },
  { id: "m-op-2", name: "Feed Bags (50lbs)" },
  { id: "m-op-3", name: "Bedding/Pine Shavings" },
  { id: "m-op-4", name: "Processing Fees/Packaging" },
];

// --- Generation Functions ---
function generateCapitalHtml(items, prefix, callback) {
  return items
    .map(
      (item) => `
        <div class="calc-row">
            <div class="row-label">
                ${item.name}
                <span class="tooltip">ⓘ<span class="tooltip-text">${item.tooltip}</span></span>
            </div>
            <div class="input-group">
                <label>Estimated Cost ($)</label>
                <input type="number" id="${item.id}-cost" value="0" min="0" step="0.01" oninput="${callback}()">
            </div>
        </div>
    `,
    )
    .join("");
}

function generateOperatingHtml(items, prefix, callback) {
  return items
    .map(
      (item) => `
        <div class="calc-row">
            <div class="row-label">${item.name}</div>
            <div class="input-group">
                <label>Quantity</label>
                <input type="number" id="${item.id}-qty" value="0" min="0" oninput="${callback}()">
            </div>
            <div class="input-group">
                <label>Price Per Unit ($)</label>
                <input type="number" id="${item.id}-price" value="0" min="0" step="0.01" oninput="${callback}()">
            </div>
        </div>
    `,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("egg-capital-container").innerHTML = generateCapitalHtml(eggCapitalItems, "egg", "calculateEggTotals");
  document.getElementById("egg-operating-container").innerHTML = generateOperatingHtml(eggOperatingItems, "egg", "calculateEggTotals");
  document.getElementById("meat-capital-container").innerHTML = generateCapitalHtml(meatCapitalItems, "meat", "calculateMeatTotals");
  document.getElementById("meat-operating-container").innerHTML = generateOperatingHtml(meatOperatingItems, "meat", "calculateMeatTotals");
});

function switchTab(evt, tabId) {
  document.querySelectorAll(".tab-content").forEach((el) => el.classList.remove("active"));
  document.querySelectorAll(".tab-btn").forEach((el) => el.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
}

function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

// --- Store global results for PDF Export ---
let currentData = { egg: {}, meat: {} };

function calculateEggTotals() {
  let totalSetup = 0;
  eggCapitalItems.forEach((item) => {
    totalSetup += parseFloat(document.getElementById(`${item.id}-cost`).value) || 0;
  });

  let totalOperating = 0;
  eggOperatingItems.forEach((item) => {
    let qty = parseFloat(document.getElementById(`${item.id}-qty`).value) || 0;
    let price = parseFloat(document.getElementById(`${item.id}-price`).value) || 0;
    totalOperating += qty * price;
  });

  let compost = parseFloat(document.getElementById("egg-compost").value) || 0;
  let dozens = parseFloat(document.getElementById("egg-production").value) || 0;
  let minsPerDay = parseFloat(document.getElementById("egg-daily-time").value) || 0;

  let hoursPerYear = (minsPerDay * 365) / 60;

  let ongoingCost = totalOperating - compost;
  let year1Total = totalSetup + ongoingCost;
  let costPerDozen = dozens > 0 ? ongoingCost / dozens : 0;

  document.getElementById("egg-res-setup").innerText = formatMoney(totalSetup);
  document.getElementById("egg-res-ongoing").innerText = formatMoney(ongoingCost);
  document.getElementById("egg-res-year1").innerText = formatMoney(year1Total);
  document.getElementById("egg-res-hours").innerText = hoursPerYear.toFixed(1) + " hrs / Year";
  document.getElementById("egg-res-per-dozen").innerText = formatMoney(costPerDozen);

  currentData.egg = {
    setup: totalSetup,
    ongoing: ongoingCost,
    year1: year1Total,
    yield: dozens,
    trueCost: costPerDozen,
    hours: hoursPerYear,
  };
}

function calculateMeatTotals() {
  let totalSetup = 0;
  meatCapitalItems.forEach((item) => {
    totalSetup += parseFloat(document.getElementById(`${item.id}-cost`).value) || 0;
  });

  let totalOperating = 0;
  meatOperatingItems.forEach((item) => {
    let qty = parseFloat(document.getElementById(`${item.id}-qty`).value) || 0;
    let price = parseFloat(document.getElementById(`${item.id}-price`).value) || 0;
    totalOperating += qty * price;
  });

  let compost = parseFloat(document.getElementById("meat-compost").value) || 0;
  let birds = parseFloat(document.getElementById("meat-birds-count").value) || 0;
  let avgWeight = parseFloat(document.getElementById("meat-avg-weight").value) || 0;
  let minsPerDay = parseFloat(document.getElementById("meat-daily-time").value) || 0;
  let batchDays = parseFloat(document.getElementById("meat-batch-days").value) || 0;

  let totalYield = birds * avgWeight;
  let hoursPerBatch = (minsPerDay * batchDays) / 60;

  let ongoingCost = totalOperating - compost;
  let batch1Total = totalSetup + ongoingCost;
  let costPerLb = totalYield > 0 ? ongoingCost / totalYield : 0;

  document.getElementById("meat-res-setup").innerText = formatMoney(totalSetup);
  document.getElementById("meat-res-ongoing").innerText = formatMoney(ongoingCost);
  document.getElementById("meat-res-batch1").innerText = formatMoney(batch1Total);
  document.getElementById("meat-res-yield").innerText = totalYield.toFixed(1) + " lbs";
  document.getElementById("meat-res-hours").innerText = hoursPerBatch.toFixed(1) + " hrs / Batch";
  document.getElementById("meat-res-per-lb").innerText = formatMoney(costPerLb);

  currentData.meat = {
    setup: totalSetup,
    ongoing: ongoingCost,
    year1: batch1Total,
    yield: totalYield,
    trueCost: costPerLb,
    hours: hoursPerBatch,
  };
}

// --- PDF Print Card Generation with Write-in Worksheet ---
function exportToPDF(type) {
  const isEgg = type === "egg";
  const title = isEgg ? "Egg-Laying Pre-Purchase Plan & Tracker" : "Meat Bird Pre-Purchase Plan & Tracker";
  const data = isEgg ? currentData.egg : currentData.meat;
  const unit = isEgg ? "Dozen" : "Lb";
  const timeUnit = isEgg ? "Year 1" : "Batch 1";

  // Arrays for looping through inputs
  const capitalItems = isEgg ? eggCapitalItems : meatCapitalItems;
  const operatingItems = isEgg ? eggOperatingItems : meatOperatingItems;

  // Generate Capital Table Rows
  let capitalRowsHTML = "";
  capitalItems.forEach((item) => {
    let cost = parseFloat(document.getElementById(`${item.id}-cost`).value) || 0;
    capitalRowsHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${formatMoney(cost)}</td>
                <td class="blank-cell"></td>
            </tr>
        `;
  });

  // Generate Operating Table Rows
  let operatingRowsHTML = "";
  operatingItems.forEach((item) => {
    let qty = parseFloat(document.getElementById(`${item.id}-qty`).value) || 0;
    let price = parseFloat(document.getElementById(`${item.id}-price`).value) || 0;
    let total = qty * price;
    operatingRowsHTML += `
            <tr>
                <td>${item.name} (Est. Qty: ${qty})</td>
                <td>${formatMoney(total)}</td>
                <td class="blank-cell"></td>
            </tr>
        `;
  });

  let html = `
        <div class="print-card">
            <div class="print-header">
                <h2>Homestead Poultry Cost Calculator</h2>
                <h3>${title}</h3>
                <p>Generated on ${new Date().toLocaleDateString()}</p>
            </div>
            
            <div class="print-section">
                <h4>1. One-Time Setup Costs</h4>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Estimated Value</th>
                            <th>Actual Spent (Write-in)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${capitalRowsHTML}
                        <tr class="total-row">
                            <td>Total Setup Estimate</td>
                            <td>${formatMoney(data.setup)}</td>
                            <td class="blank-cell"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="print-section">
                <h4>2. Recurring Consumables</h4>
                <table class="print-table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Estimated Value</th>
                            <th>Actual Spent (Write-in)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${operatingRowsHTML}
                        <tr class="total-row">
                            <td>Total Operating Estimate</td>
                            <td>${formatMoney(data.ongoing + parseFloat(document.getElementById(isEgg ? "egg-compost" : "meat-compost").value) || 0)}</td>
                            <td class="blank-cell"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="print-section">
                <h4>3. Financial Summary & Reality Check</h4>
                <div class="print-row" style="color: #8B0000; font-weight: bold;">
                    <span>Total Cash Needed Estimate (${timeUnit})</span>
                    <span>${formatMoney(data.year1)}</span>
                </div>
                <div class="print-row">
                    <span>Expected Yield</span>
                    <span>${data.yield.toFixed(1)} ${isEgg ? "Dozens" : "Lbs"}</span>
                </div>
            </div>

            <div class="print-section print-total">
                <div class="print-row">
                    <span>Estimated Ongoing Cost Per ${unit} (Grocery Replacement Value)</span>
                    <span>${formatMoney(data.trueCost)}</span>
                </div>
            </div>
            
            <p style="text-align: center; font-size: 13px; color: #666; margin-top: 30px; font-style: italic;">
                Pin this to a clipboard in the barn or keep it in your files. Fill in the "Actual Spent" column throughout the season to see how close your estimates were!
            </p>
        </div>
    `;

  document.getElementById("print-layout").innerHTML = html;
  window.print();
}

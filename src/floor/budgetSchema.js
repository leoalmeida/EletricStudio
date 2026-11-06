const money=n=>Number.isFinite(n)&&n>=0&&n<=1e9;
export function validBudget(b){
 if(!b||typeof b!=='object'||!['all','current'].includes(b.scope)||!Number.isFinite(b.reservePercent)||b.reservePercent<0||b.reservePercent>100||!Number.isFinite(b.discountPercent)||b.discountPercent<0||b.discountPercent>100||!money(b.freight)||typeof b.notes!=='string'||b.notes.length>4000||!b.prices||typeof b.prices!=='object'||Array.isArray(b.prices)||Object.keys(b.prices).length>10000||!Array.isArray(b.manualItems)||b.manualItems.length>1000)return false;
 const validPrice=p=>p&&typeof p==='object'&&(p.unitPrice===null||money(p.unitPrice))&&money(p.laborPrice)&&typeof p.included==='boolean';
 if(Object.entries(b.prices).some(([key,p])=>key.length>500||!validPrice(p)))return false;
 const ids=new Set();for(const row of b.manualItems){if(!row||typeof row.id!=='string'||!row.id||ids.has(row.id)||typeof row.label!=='string'||row.label.length>160||!['un','m','serviço','lote'].includes(row.unit)||!Number.isFinite(row.quantity)||row.quantity<0||row.quantity>1e7||!validPrice(row))return false;ids.add(row.id);}
 return true;
}

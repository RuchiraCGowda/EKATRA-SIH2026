export interface UnitEconomicsModel {
  materialCategory: string;
  monthlyVolumeKg: number;
  informalMiddlemanRatePerKg: number;
  ekatraPlatformRatePerKg: number;
  informalTransportCostPerMonth: number;
  ekatraDoorstepPickupSavingPerMonth: number;
}

export interface UnitEconomicsComparison {
  traditionalMonthlyGross: number;
  traditionalTransportCost: number;
  traditionalNetIncome: number;
  ekatraMonthlyGross: number;
  ekatraDoorstepSaving: number;
  ekatraNetIncome: number;
  monthlyIncomeDifference: number;
  percentageUplift: number;
  annualAdditionalEarnings: number;
}

export function calculateUnitEconomics(model: UnitEconomicsModel): UnitEconomicsComparison {
  const traditionalMonthlyGross = model.monthlyVolumeKg * model.informalMiddlemanRatePerKg;
  const traditionalTransportCost = model.informalTransportCostPerMonth;
  const traditionalNetIncome = Math.max(0, traditionalMonthlyGross - traditionalTransportCost);

  const ekatraMonthlyGross = model.monthlyVolumeKg * model.ekatraPlatformRatePerKg;
  const ekatraDoorstepSaving = model.ekatraDoorstepPickupSavingPerMonth;
  const ekatraNetIncome = ekatraMonthlyGross; // Recycler provides doorstep pickup

  const monthlyIncomeDifference = ekatraNetIncome - traditionalNetIncome;
  const percentageUplift =
    traditionalNetIncome > 0
      ? Math.round((monthlyIncomeDifference / traditionalNetIncome) * 100)
      : 0;
  const annualAdditionalEarnings = monthlyIncomeDifference * 12;

  return {
    traditionalMonthlyGross,
    traditionalTransportCost,
    traditionalNetIncome,
    ekatraMonthlyGross,
    ekatraDoorstepSaving,
    ekatraNetIncome,
    monthlyIncomeDifference,
    percentageUplift,
    annualAdditionalEarnings,
  };
}

// NB = CarbCalcFunctions.js Changed from CarbCalc.js to export each function separately
// ******************* //
// initially, code to re-create pH isopleths on WQ map
// see = https =//stackoverflow.com/questions/33178843/es6-export-default-with-multiple-functions-referring-to-each-other

// --------------------------------------- //
// --------------------------------------- //
// ----- UTILITY FUNCTIONS FOR IDYLL ----- //
// --------------------------------------- //
// --------------------------------------- //

// -- "API" into CarbCalc for Idyll D3 visualizations (pH, for starters) -- //

// ******* CO2 ******* //
// ******************* //

// NB: When needed, over-ride round() in generalConversions
const round = (value, decimals) =>
  Number(Math.round(value + "e" + decimals) + "e-" + decimals);

export const isSafe_Co2 = (temp, sal, alk, ph_nbs, co2_crit) => {
  // convert ph_nbs to ph_free
  const ph_free = phNbsToPhFree(ph_nbs, sal, temp, 0);

  // 'rough' convert alk to mol/kg here??

  const dic = calcDicOfAlk(alk, ph_free, temp, sal);

  const co2 = calcCo2OfDic(dic, temp, sal, ph_free) * 1000;

  // console.log(`[CO2] = ${co2} mg/kg`);

  const warningZone = 0.75;

  // ***********
  // Calc CO2 critical-pH thresholds for red (danger) & yellow (warning)

  // %%%%%%%%%%%%%%%
  //   % Case 4  (s and ALK given)
  // while (flag == 4 & i <= numOfInputs)
  //     s = s1(i);
  //     alk = alk1(i);

  //     p4 = 1.;
  //     p3 = Kb+alk;
  //     p2 = alk*Kb-s*K1-Kb*bor-Kw;
  //     p1 = -s*Kb*K1-s*2.*K1*K2-Kw*Kb;
  //     p0 = -2.*s*Kb*K1*K2;
  //     p = [p4 p3 p2 p1 p0];
  //     r = roots(p);
  //     h = max(real(r));
  //     h*1.e12;
  //     dic = s*(1.+K1/h+K1*K2/h/h);
  //     hco3 = dic/(1+h/K1+K2/h);
  //     co3 = dic/(1+h/K2+h*h/K1/K2);
  //     %    alk = s*(K1/h+2.*K1*K2/h/h)+Kb*bor/(Kb+h)+Kw/h-h;
  //     fco2 = s/Kh;
  //     pco2 = fco2/p2f;

  //     % ----------- change units: mumol/kg
  //     %h1 = 10^(-ph1);
  //     CO2_r(i)    = 1.e6*s;
  //     HCO3_r(i)   = hco3*1.e6;
  //     CO3_r(i)    = co3*1.e6;
  //     DIC_r(i)    = dic*1.e6;
  //     ALK_r(i)    = alk*1.e6;
  //     pCO2_r(i)   = pco2*1.e6;
  //     fCO2_r(i)   = fco2*1.e6;
  //     H_r(i)      = h;

  //     i = i + 1;
  // end
  // %%%%%%%%%%%%%%%

  // Convert co2_crit (given here) as mg/L to mmol/kg
  // 44.0096 mg/mmol
  // ( [ co2_crit ] / [ 44.0096 ] ) --> ( [        ] / [  rho ] ) --> [        ] [ 1000 g/kg ]
  // ( [   mg/L]  ] / [ mg/mmol ] ) --> ( [ mmol/L ] / ([  g/L ] / [ 1000 g/kg ]) ) --> [ mmol/g ] --> mmol/kg
  const co2_crit_mol_kg =
    co2_crit / 44.0096 / (calcRho(temp, sal) / 1000) / 1000;

  // console.log(dic);
  // console.log(temp);
  // console.log(sal);
  // console.log(`${co2_crit} mg/L`);
  // console.log(`${co2_crit / 44.0096} mmol/L`);
  // console.log(`${calcRho(temp, sal)} g/L`);
  // console.log(`${calcRho(temp, sal) / 1000} kg/L`);
  // console.log(`${co2_crit / 44.0096 / (calcRho(temp, sal) / 1000)} mmol/kg`);
  // console.log(
  //   `${co2_crit / 44.0096 / (calcRho(temp, sal) / 1000) / 1000} mol/kg`
  // );

  // // For CO2, critPh_yellow > critPh_red
  // console.log(`critPh_red: ${critPh_red}`);
  // console.log(`critPh_yellow: ${critPh_yellow}`);
  // ***********

  const result = {
    // if co2 equals or exceed the critical level, turn on RED light
    red: co2 >= co2_crit ? true : false,
    // if co2 is less than the critical level AND co2 equals or exceeds the 'warning' level, turn on YELLOW light
    yellow: co2 < co2_crit && co2 >= warningZone * co2_crit ? true : false,
    // if co2 is less than ~80% of the critical level, turn on GREEN light
    green: co2 < warningZone * co2_crit ? true : false,
    // send value to display in whichever light is TRUE
    value: co2 >= 10 ? round(co2, 1) : round(co2, 2),
  };

  return result;
};

export const isSafe_Uian = (temp, sal, ph_nbs, tan, uian_crit) => {
  // convert ph_nbs to ph_free
  const ph_free = phNbsToPhFree(ph_nbs, sal, temp, 0);

  // Output in percent
  const uianPoSto = percentNh3ForTemp(temp, sal, ph_free);

  const uian = (1000 * (tan * uianPoSto)) / 100; // μg/L

  // console.log(" ");
  // console.log(`UIA-N -> ${uianPoSto}%`);
  // console.log(`[UIA-N] -> ${uian}`);

  const warningZone = 0.75;

  const result = {
    // if uian equals or exceed the critical level, turn on RED light
    red: uian >= uian_crit ? true : false,
    // if uian is less than the critical level AND uian equals or exceeds the 'warning' level, turn on YELLOW light
    yellow: uian < uian_crit && uian >= warningZone * uian_crit ? true : false,
    // if uian is less than ~80% of the critical level, turn on GREEN light
    green: uian < warningZone * uian_crit ? true : false,
    // send value to display in whichever light is TRUE
    value: uian >= 10 ? round(uian, 1) : round(uian, 2),
  };

  return result;
};

export const isSafe_OmegaAr = (
  temp,
  sal,
  ph_nbs,
  alk,
  calcium,
  omegaAr_crit
) => {
  // Convert ph_nbs to ph_free for DIC calc
  const ph_free = phNbsToPhFree(ph_nbs, sal, temp, 0);

  // [NB] USE pH FREE for DIC CALC
  const dic = calcDicOfAlk(alk, ph_free, temp, sal);

  // [NB] USE pH NBS for OMEGA CALC
  const omegaAr = calcOmegaAr(dic, calcium / 40078, temp, sal, ph_nbs);

  // console.log(" ");
  // console.log(`omegaAr =  ${omegaAr}`);

  const warningZone = 1.25;

  const result = {
    // if omegaAr equals or exceed the critical level, turn on RED light
    red: omegaAr <= omegaAr_crit ? true : false,
    // if omegaAr is less than the critical level AND omegaAr equals or exceeds the 'warning' level, turn on YELLOW light
    yellow:
      omegaAr > omegaAr_crit && omegaAr <= warningZone * omegaAr_crit
        ? true
        : false,
    // if omegaAr is less than ~80% of the critical level, turn on GREEN light
    green: omegaAr > warningZone * omegaAr_crit ? true : false,
    // send value to display in whichever light is TRUE
    value: round(omegaAr, 2),
  };

  return result;
};

// ---------- END IDYLL UTILITIES -------- //
// --------------------------------------- //

// ---- density calcs ----

// ** NB: TEMP IS IN CELCIUS, ** NOT ** KELVIN

// NB: SMOW --Standard Mean Ocean Water
export const calcRhoFW = (t) => {
  // **  input temp, dT, in KELVIN
  // ** define a local temp in CELCIUS

  const tempInCelcius = t - 273.15;

  let rhoFw = 999.842594 + 0.06793952 * tempInCelcius;
  rhoFw = rhoFw + -0.00909529 * tempInCelcius * tempInCelcius;

  rhoFw = rhoFw + 0.0001001685 * Math.pow(tempInCelcius, 3);
  rhoFw = rhoFw + -0.000001120083 * Math.pow(tempInCelcius, 4);
  rhoFw = rhoFw + 0.000000006536332 * Math.pow(tempInCelcius, 5);

  return rhoFw;
};

// ** NB: TEMP IS IN CELCIUS, ** NOT ** KELVIN
// ***** SW rho(T, S)
// return: kg/m3 (g/L)
// see: http://www.phys.ocean.dal.ca/~kelley/seawater/density.html
//
export const calcRho = (t, sal) => {
  // ** input temp, dT, in KELVIN
  // ** define a local temp in CELCIUS
  const tempInCelcius = t - 273.15;

  let A = 0.824493 - 0.0040899 * tempInCelcius;
  A = A + 0.000076438 * tempInCelcius * tempInCelcius;
  A = A + -0.00000082467 * Math.pow(tempInCelcius, 3);
  A = A + 0.0000000053875 * Math.pow(tempInCelcius, 4);

  let B = -0.00572466 + 0.00010227 * tempInCelcius;
  B = B + -0.0000016546 * tempInCelcius * tempInCelcius;

  const C = 0.00048314;

  // ** NB: SEND calcRhoFW temp in **KELVIN**, it will change to C
  // **     Why? In case need to call calcRhoFW from another
  // **     method that send temp in KELVIN
  let myRhoSW = calcRhoFW(t) + A * sal;
  myRhoSW = myRhoSW + B * Math.pow(sal, 1.5);
  myRhoSW = myRhoSW + C * sal * sal;

  return myRhoSW;
};

// 'new' coeffs from Millero & Huang, Table 2 Ocean Sci., 5, 91–100 (2009)
export const calcRhoMilleroHuang = (t, sal) => {
  // ** input temp, dT, in KELVIN
  // ** define a local temp in CELCIUS
  const tempInCelcius = t - 273.15;

  let A = 0.8246111 - 0.003956103 * tempInCelcius;
  A = A + 0.00007274549 * tempInCelcius * tempInCelcius;
  A = A + -0.0000008239634 * Math.pow(tempInCelcius, 3);
  A = A + 0.000000005332909 * Math.pow(tempInCelcius, 4);

  let B = -0.006006733 + 0.00007970908 * tempInCelcius;
  B = B + -0.000001018797 * tempInCelcius * tempInCelcius;

  const C = 0.0005281399;

  // ** NB: SEND calcRhoFW temp in **KELVIN**, it will change to C
  // **     Why? In case need to call calcRhoFW from another
  // **     method that send temp in KELVIN
  let myRhoSW = calcRhoFW(t) + A * sal;
  myRhoSW = myRhoSW + B * Math.pow(sal, 1.5);
  myRhoSW = myRhoSW + C * sal * sal;

  return myRhoSW;
};

// ---- CO2 -----
// // return: g/kg-soln
export const calcCo2OfDic = (dic, t, s, ph) => {
  let myCo2 = dic * alphaZero(t, s, ph);

  // * correct? * return mg/kg
  myCo2 = 44.0096 * myCo2;

  return myCo2;
};

// ---- TANCalc methods ----

// calc pH at which un-ionized ammonia becomes unsafe for a given level of TAN
// from Fivelstad formula
export const calcCritPhTan = (tan, unIonized, temp, sal) => {
  temp = temp - 273.15; // added for R version

  let critPhTan = 10.0869 + 0.002 * sal - 0.034 * temp;
  critPhTan =
    critPhTan -
    0.43429448190325182765 * Math.log((tan - unIonized) / unIonized);

  return critPhTan;
};

// calc % un-ionized ammonia according to Fivelstad formula
export const calcUnIonPoStoFivelsted = (mypH, temp, sal) => {
  temp = temp - 273.15; // added for R version

  let unIonPoSto = 9.242;
  unIonPoSto = unIonPoSto + 0.002 * sal;
  unIonPoSto = unIonPoSto + (0.034 * (24.85 - temp) - mypH);
  unIonPoSto = 1.0 / (1.0 + Math.pow(10, unIonPoSto));

  return unIonPoSto;
};

// calc % un-ionized ammonia according to Johansson & Wedborg formula
export const calcUnIonPoStoJohanssonWedborg = (mypH, temp, sal) => {
  let unIonPoSto = -0.467;
  unIonPoSto = unIonPoSto + 0.00113 * sal;
  //  unIonPoSto = unIonPoSto + 2887.9 / (temp + 273.15) // original formulation
  unIonPoSto = unIonPoSto + 2887.9 / temp;
  unIonPoSto = unIonPoSto + -mypH;
  unIonPoSto = 1.0 / (1.0 + Math.pow(10, unIonPoSto));

  return unIonPoSto;
};

// TANCalc methods from WQTech 0.95 (xCode project)
//pragma mark - NH3 & HNO2 calcs

// **                                   ** //
// ** Nitrogen MWs ** //
// **                                   ** //
const NH3 = 17.031; // g NH3/mole
const NH4 = 18.038; // g NH4/mole
// const HNO3 = 47.01344; // g HNO3/mole
// const NO3 = 62.0049; // g NO3/mole
// const HNO2 = 47.01344; // g HNO2/mole
// const NO2 = 46.0055; // g NO2/mole
const N = 14.00674; // g N/mole

// const H = 1.00794; // g H/mole
// const O = 15.9994; // g O/mole

// [ADDED 06-II-2020] Convert TA-N & UIA-N units for UiaContext critical UIA-N calculation
// @param val ~ number
// @param units in [μg/L, μg/kg, mg/L, mg/kg, mmol/L, mmol/kg]
// @param rho in g/L (kg/m3)
// return μg/kg, used here as I.C. units
export const ammoniaToMuGramsPerKg = (val, units, rho, percentUian) => {
  if ("μg/L" === units) {
    return val * (1000.0 / rho);
  }
  if ("μg/kg (ppb)" === units) {
    return val;
  }
  if ("mg/L" === units) {
    return val * 1000.0 * (1000.0 / rho);
  }
  if ("mg/kg (ppm)" === units) {
    return val * 1000.0;
  }
  if ("mmol/L (mM)" === units) {
    const MW = calcAmmoniaWeightedMw(percentUian / 100);
    return (val * MW * 1000.0 * 1000.0) / rho;
    // return (val * NH3 * 1000.0 * 1000.0) / rho;
  }
  if ("mmol/kg" === units) {
    const MW = calcAmmoniaWeightedMw(percentUian / 100);
    // console.log(`|||||||||||||||||`);
    // console.log(`convert ${units} to μg/kg`);
    // console.log(`weighted MW: ${MW} mg/mmol`);
    // console.log(`${val} ${units} = ${val * MW * 1000} μg/kg`);
    // console.log(`|||||||||||||||||`);
    return val * MW * 1000.0;
    // return val * NH3 * 1000.0;
  }
};

// [KLUDGE] A reduced, ad hoc version of converter.R's function
//          tanToAllUnits = function(tan, rho, uia_posto, dec_places, num_digits)
//          in WQ_iQuaCalc_Lite_03.R for UiaContext.js (and WqSnapshot of RhoContext.js)
// @param ammVal_in, value of input units
// @param ammUnits_in, one of [μg/L, μg/kg, mg/L, mg/kg, mmol/L, mmol/kg]
// @param ammUnits_out, one of [μg/L, μg/kg, mg/L, mg/kg, mmol/L, mmol/kg]
// [NB] @param uia_posto (uian_fraction) not needed in this ad hoc version
//      because ammVal will = UIA-N || (TA-N * uian_fraction)
//      The goal is to express (TA-N * uian_fraction) in UIA-N's units
// @param rho in g/L (kg/m3)
// return 'ammVal_out', conversion of ammVal_in ammUnits_in to ammUnits_out
// [EXAMPLE] User enters 0.05 mmol/L (mM) TA-N, pH 7.5, 31.2 C, 20 ppt
//           => 2.105% UIA-N
//           (0.05 mmol/L TA-N)(0.02105) = 0.01052501 mmol/L UIA-N
//           that value must be converted to μg/L, the units of critical UIA-N
export const ammoniaToTargetUnits = (
  ammVal_in,
  ammUnits_in,
  ammUnits_out,
  rho,
  percentUian
) => {
  // convert ammVal_in of ammUnits_in to I.C. units (μg/kg)
  const ammVal_in_ic = ammoniaToMuGramsPerKg(
    ammVal_in,
    ammUnits_in,
    rho,
    percentUian
  );

  // console.log(`IN: ${ammVal_in} ${ammUnits_in}`);
  // console.log(`Converted: ${ammVal_in_ic} μg/kg`);

  // now, convert ammVal_in_ic from μg/kg to ammUnits_out,
  //      of which there are (only) four options in this case

  // [N'OUBLIE PAS] "μg/L" here are the units of crit UIA-N
  if ("μg/L" === ammUnits_out) {
    // change μg/kg (I.C) to μg/L
    // here, return value in μg/L
    return (ammVal_in_ic * rho) / 1000.0;
  }
  if ("μg/kg (ppb)" === ammUnits_out) {
    return ammVal_in_ic;
  }
  if ("mg/L" === ammUnits_out) {
    return (ammVal_in_ic * rho) / (1000.0 * 1000.0);
  }
  if ("mg/kg (ppm)" === ammUnits_out) {
    return ammVal_in_ic / 1000.0;
  }
  if ("mmol/L (mM)" === ammUnits_out) {
    // console.log(`μg/kg to ${ammUnits_out}`);
    // console.log((ammVal_in_ic * rho) / (1000.0 * 1000.0));
    const MW = calcAmmoniaWeightedMw(percentUian / 100);
    return (ammVal_in_ic / (MW * 1000.0)) * (rho / 1000.0);
  }
  if ("mmol/kg" === ammUnits_out) {
    // change μg/kg (I.C) to mmol/kg
    const MW = calcAmmoniaWeightedMw(percentUian / 100);
    return ammVal_in_ic / (MW * 1000.0);
  }
};

// Calculate Total Ammonia from fraction UIA-N
// @param fractionUian (NB: not percentage)
// return the factor with which to multiply TA-N to yield TA
// this factor is between 1.215915 (pure un-ionized ammonia)
//                    and 1.287808 (pure ionized ammonia)
// RESULT: mg/L Total Ammonia
export const calcTotalAmmonia = (fractionUian) => {
  const totalAmmoniaFactor =
    1 / ((1 - fractionUian) * (N / NH4) + fractionUian * (N / NH3));
  return totalAmmoniaFactor;
};

// Calculate MW of Ammonia | fraction UIA(-N} of TA(-N)
// Result [17.031 mg NH3/mmol - 18.038 mg NH4/mmol]
// Used to convert between concentrations in moles and mass
export const calcAmmoniaWeightedMw = (fractionUian) => {
  return (1 - fractionUian) * NH4 + fractionUian * NH3;
};

// ** calc the percentage of un-ionized ammonia
// ** [CHECK] pH on FREE proton scale...Yes

// ** output percentage (same for total ammonia or total ammonia nitrogen)
// ** and percentage need not be converted to, e.g., the NBS scale, eh?
// ** double thePercentage = 100.0 / (1.0 + (1.0 / pow(10,-(-log10(kNH4))+pH)));

// ** NB: "threshold level of 0.025 mg/L (25 μg/L)
// **     "Un-ionized Ammonia of 0.05 mg/L (50 μg/L) may harm fish.
// **     "As Un-ionized Ammonia approaches 2.0 mg/L (2000 μg/L), fish will begin to die."

// ** USE percentNh3ForTemp() ** -- 02-II-2020 -- ** //
// [CHECK]
// temp = 20 C (293.15 K), sal = 30 ppt, TA = 0.002
// pH (NBS) = 7.910036 (7.854653 FREE)
// 1 mg TA-N/L (0.0000588 mol/kg-soln)
export const percentNh3ForTemp = (t, sal, ph) => {
  const pKNH4 = -Math.log10(getKNH4(t, sal, 0));
  const expOfTen = pKNH4 - ph;

  return 100.0 / (1.0 + Math.pow(10, expOfTen));
};

// [HACK] Percentage NITROUS ACID
//        have not found temp- &/or sal-dependence
export const percentNo2ForTemp = (ph) => {
  const pKNO2 = 3.39;
  const expOfTen = pKNO2 - ph;

  return 100.0 / (1.0 + Math.pow(10, expOfTen));
};

// NB: On the FREE scale
export const critPhFreeForTanMillero = (tan, uia, t, s) => {
  // console.log(
  //   `IN critPhFreeForTanMillero, ${tan} / ${uia} - 1 = ${tan / uia - 1}`
  // );

  return -Math.log10(tan / uia - 1) - Math.log10(getKNH4(t, s, 0));
};

// ** T-, S-, & pH-dependent K of NH4+ from Millero et al. (1995)
// ** pH scale: SWS
// ** concentration scale: mol/kg-soln
export const getKNH4 = (t, sal, p) => {
  const sqrtS = Math.sqrt(sal);

  const A = -0.25444 + 0.46532 * sqrtS - 0.01992 * sal;
  const B = -6285.33 - 123.7184 * sqrtS + 3.17556 * sal;
  const D = 0.0001635;

  const KNH4 = A + B / t + D * t;

  // ** NB: THIS conversion puts it on the FREE pH scale, as per AquaEnv
  // **     factor for sws2free = 1.0 / ahFreeToSwsFactorForSalinity:temp:pressure:
  // **     WHEN DEALING WITH -log10, -log10(1 / ah) = -(-log10(ah)) = +log10(ahFreeToSWSFactor...)

  const pKNH4 = -Math.log10(Math.exp(KNH4));

  const pKNH4_FREE = pKNH4 + Math.log10(ahFreeToSwsFactor(sal, t, 0.0));

  // ** ** ** ** ** ** //
  // ** NB: pKNH4_Nbs, sf, & pKNH4_Nbs2 commented out ** //
  // ** ** ** ** ** ** //

  // ** do a calc in terms of NBS scale
  // const pKNH4_Nbs = pKNH4 - Math.log10(ahSwsToNbsFactor(sal, t, 0.0));

  // const sf =
  //   Math.log10(ahFreeToSwsFactor(sal, t, 0.0)) +
  //   Math.log10(ahSwsToNbsFactor(sal, t, 0.0));

  // const pKNH4_Nbs2 = pKNH4_FREE - sf;

  return Math.pow(10, -pKNH4_FREE); // K-NH4
};

// ******************************* //
// see AquaEnv, Constants & Formulae, p. 9
// "Note that, as given in Dickson [1984, p. 2303] and Dickson and Riley [1979a, p. 91f] all concentrations appearing
// in the definition for the total and the seawater pH scale are molal, i.e. mol/kg-H2O, concentrations.
// But in Roy et al. [1993b, p. 257] and in DOE [1994, chap.. 4, SOP 6, p. 1] it is stated, that concentrations
// for the seawater and total pH scale are molin, i.e. mol/kg-soln. To be consistent with DOE [1994] and
// Dickson et al. [2007] mol/kg-soln is chosen here for the free, total and seawater scale."

// "To be consistent with Lewis and Wallace [1998], the NBS scale is based on the proton concentration on mol/kg-H2O."
// ******************************* //

// NB: pH(NBS) = pH(Free) -
//               log10(ahFreeToSwsFactor(S, T(Kelvin), 0)) -
//               log10(ahSwsToNbsFactor())
// pH(FREE) = pH(NBS) + log10(ahFreeToSwsFactor(S, T(Kelvin), 0)) + log10(ahSwsToNbsFactor())
export const phFreeToPhNbs = (phFree, sal, temp, p) => {
  // console.log(
  //   `${-Math.log10(calcProtonActivityCoeffZg(temp, sal, p)) -
  //     Math.log10(ahSwsToNbsFactor(sal, temp, p)) +
  //     Math.log10(ahMolalToMolinforSalinity(sal))}`
  // );
  // console.log(
  //   `${-Math.log10(ahSwsToNbsFactor(sal, temp, p)) -
  //     Math.log10(ahFreeToSwsFactor(sal, temp, p)) +
  //     Math.log10(ahMolalToMolinforSalinity(sal))}`
  // );
  // console.log(`~~~~~~~~~~~~~`);

  return (
    phFree -
    Math.log10(ahSwsToNbsFactor(sal, temp, p)) -
    Math.log10(ahFreeToSwsFactor(sal, temp, p))
    // +
    // Math.log10(ahMolalToMolinforSalinity(sal))
  );
};

export const phNbsToPhFree = (phNbs, sal, temp, p) => {
  return (
    phNbs +
    Math.log10(ahSwsToNbsFactor(sal, temp, p)) +
    Math.log10(ahFreeToSwsFactor(sal, temp, p))
    // -
    // Math.log10(ahMolalToMolinforSalinity(sal))
  );
};

export const ahFreeToTotFactor = (sal, temp, p) => {
  return 1 + calcTS(sal) / calcKsDickson(temp, sal, 0.0);
};

export const ahSwsToNbsFactor = (sal, temp, p) => {
  return (
    calcProtonActivityCoeffZg(temp, sal, 0.0) / ahMolalToMolinforSalinity(sal)
  );
};

export const ahFreeToSwsFactor = (sal, temp, p) => {
  return (
    1 +
    calcTS(sal) / calcKsDickson(temp, sal, 0.0) +
    calcTF(sal) / calcKfDickson(temp, sal, 0.0)
  );
};

export const calcProtonActivityCoeffZg = (temp, sal, p) => {
  let rootGamma = Math.sqrt(calcIonicStrength(sal));

  let myHActivityCoeff = 1820000.0 * Math.pow(79 * temp, -1.5);

  myHActivityCoeff =
    myHActivityCoeff *
    (rootGamma / (1 + rootGamma) - 0.2 * calcIonicStrength(sal));

  myHActivityCoeff = Math.pow(10, -myHActivityCoeff);

  return myHActivityCoeff;
};

export const calcIonicStrength = (sal) => {
  let myIS = (19.924 * sal) / (1000.0 - 1.005 * sal); // mole/kg-H2O (molal)
  return myIS;
};

export const ahMolalToMolinforSalinity = (sal) => {
  return 1.0 - 0.001005 * sal;
};

export const calcTF = (sal) => {
  return 0.0000019522 * sal;
};

export const calcTS = (sal) => {
  return 0.0008067267 * sal;
};

// // pH scale = FREE
// // concentration scale = mole/kg-H2O ?? -> molin...?
export const calcKfDickson = (temp, sal, p) => {
  let fluorFactor1 = 1590.2 / temp;
  let fluorFactor2 = -12.641;
  let fluorFactor3 = 1.525 * Math.sqrt(calcIonicStrength(sal));

  // // ** nb = molalToMolin factor in sqrt()...
  // //    double fluorFactor3 = 1.525 * sqrt([self calcIonicStrength =s] * (1.0 - 0.001005 * s));

  let molal2molin = Math.log(1.0 - 0.001005 * sal);

  let KF = fluorFactor1 + fluorFactor2 + fluorFactor3 + molal2molin;

  return Math.exp(KF);
};

// // bisulfate dissociation
// // Dickson (1990); DOE (1994), ch. 5 p. 13; Z & W-G (2001) p. 260
// // pH scale = Free
// // concentration scale = mol/kg-H2O, CONVERTED TO AND RETURNED AS mol/kg-soln (molin)
// // **** nb **** if called from within pH conversion, T already C -> K *******
// // **** nb **** else if called from getKS(), must add 273.15 in call ****************
export const calcKsDickson = (temp, sal, p) => {
  // // ** NB = ionic strength calc now returns molal, so
  // // **     change to molin (mol/kg-soln) here for this calc
  // //    double myIS = [self calcIonicStrength =s] * (1.0 - 0.001005 * s);
  let myIS = calcIonicStrength(sal);

  let sulfFactor1 = 141.328 - 4276.1 / temp;
  let sulfFactor2 = -23.093 * Math.log(temp);
  let sulfFactor3 =
    (324.57 - 47.986 * Math.log(temp) - 13856 / temp) * Math.sqrt(myIS);
  let sulfFactor4 = (-771.54 + 114.723 * Math.log(temp) + 35474 / temp) * myIS;
  let sulfFactor5 = (-2698.0 * Math.pow(myIS, 1.5)) / temp;
  let sulfFactor6 = (1776.0 * myIS * myIS) / temp;

  let molal2molin = Math.log(1.0 - 0.001005 * sal);

  // // ** in mol/kg-soln (MOLIN)
  let KS =
    sulfFactor1 +
    sulfFactor2 +
    sulfFactor3 +
    sulfFactor4 +
    sulfFactor5 +
    sulfFactor6 +
    molal2molin;

  // // ** in mol/kg-H2O (MOLAL)
  // //	double KS = sulfFactor1 + sulfFactor2 + sulfFactor3 + sulfFactor4 + sulfFactor5 + sulfFactor6;

  return Math.exp(KS);
};

export const phLineIntercept = (temp, sal, ph) => {
  // console.log(`calcHydroxide = ${calcHydroxide(ph, temp, sal)}`);
  // console.log(`calcHydronium = ${calcHydronium(ph)}`);
  // console.log(`   calcBorate = ${calcBorate(ph, temp, sal)}`);
  return (
    calcHydroxide(ph, temp, sal) - calcHydronium(ph) + calcBorate(ph, temp, sal)
  );
};

export const calcHydroxide = (ph, t, sal) => {
  // if(sal === null)
  //   return();
  let kWToTheTen = Math.log10(calcKWMehrbach(t, sal));

  return Math.pow(10, kWToTheTen + ph);
};

export const calcKWMehrbach = (temp, sal) => {
  // if(sal === null)
  //   return()

  let expSum = 148.9652; // // nb = "148.965 02" in Zeebe & Wolf-Gladrow code
  expSum = expSum - 13847.26 / temp;
  expSum = expSum - 23.6521 * Math.log(temp);
  expSum =
    expSum +
    (-5.977 + 118.67 / temp + 1.0495 * Math.log(temp)) * Math.sqrt(sal);
  expSum = expSum - 0.01615 * sal;

  let KW = Math.exp(expSum); // // still on TOTAL scale
  let pKW = -Math.log10(KW); // // still on TOTAL scale

  // // ** nb = convert to FREE pH scale, as per AquaEnv
  pKW = pKW + Math.log10(ahFreeToTotFactor(sal, temp, 0.0));

  return Math.pow(10, -pKW);
};

export const calcHydronium = (ph) => {
  return Math.pow(10, -ph);
};

export const phLineSlope = (temp, sal, ph) => {
  return alphaOne(temp, sal, ph) + 2 * alphaTwo(temp, sal, ph);
};

// // Borate ----
// // ** FREE scale?
export const calcBorate = (ph, t, sal) => {
  let concB = calcBorateConcOfSalinity(sal);

  let myKB = calcBorateFactor(t, sal);

  let borate = (myKB * concB) / (myKB + Math.pow(10, -ph));

  return borate;
};

export const calcBorateConcOfSalinity = (sal) => {
  let concB = (0.000232 * sal) / (10.811 * 1.80655);

  return concB;
};

export const calcBorateFactor = (t, sal) => {
  // if(sal === null)
  //   return();

  let A = 148.0248 + 137.1942 * Math.sqrt(sal) + 1.62142 * sal;
  let B =
    -8966.9 -
    2890.53 * Math.sqrt(sal) -
    77.942 * sal +
    1.728 * Math.pow(sal, 1.5) -
    0.0996 * sal * sal;
  let C = -24.4344 - 25.085 * Math.sqrt(sal) - 0.2474 * sal;
  let D = 0.053105 * Math.sqrt(sal);

  let K_BOH3 = Math.exp(A + B / t + C * Math.log(t) + D * t);

  let ans = Math.pow(
    10,
    -(-Math.log10(K_BOH3) + Math.log10(ahFreeToTotFactor(sal, t, 0)))
  );

  return ans;
};

// ALPHA-SUB-*

export const alphaZero = (temp, sal, ph) => {
  // NB: declare p LOCALLY until incorporate in calcs
  const p = 0.0;

  const h = calcHydronium(ph);
  const k1 = getK1(temp, sal, p);
  const k2 = getK2(temp, sal, p);

  const numerator = h * h;

  return numerator / calcAlphaDenom(h, k1, k2);
};

export const alphaOne = (temp, sal, ph) => {
  // // nb = define p LOCALLY until incorporate in calcs
  // let p = 0.0;

  let h = calcHydronium(ph);

  let k1 = getK1(temp, sal, 0);

  let k2 = getK2(temp, sal, 0);

  let numerator = h * k1;

  return numerator / calcAlphaDenom(h, k1, k2);
};

export const alphaTwo = function (temp, sal, ph) {
  // // nb = define p LOCALLY until incorporate in calcs
  // let p = 0.0;

  let h = calcHydronium(ph);

  let k1 = getK1(temp, sal, 0);

  let k2 = getK2(temp, sal, 0);

  let numerator = k1 * k2;

  return numerator / calcAlphaDenom(h, k1, k2);
};

export const calcAlphaDenom = (h, k1, k2) => {
  return h * h + k1 * h + k1 * k2;
};

// // T- and S-dependent K1 from Millero et al. (2006)
// // ** pH scale = SWS for calculation, FREE returned
export const getK1 = (temp, sal, p) => {
  // if(is.null(sal))
  //   return()

  const sqrtS = Math.sqrt(sal);
  const lnT = Math.log(temp);

  let pK1z = -126.34048 + 6320.813 / temp + 19.568224 * lnT; // // was "19.56822.."
  let A = 13.4191 * sqrtS + 0.0331 * sal - 0.0000533 * sal * sal;
  let B = -530.123 * sqrtS - 6.103 * sal;
  let C = -2.0695 * sqrtS;
  let pK1 = pK1z + A + B / temp + C * lnT;

  // // ** nb = THIS conversion puts it on the FREE pH scale *from* the SWS scale, as per AquaEnv
  // // **     factor for sws2free = 1.0 / ahFreeToSwsFactorForSalinity =temp =pressure =
  // // **     when dealing with -log10, -log10(1 / ah) = -(-log10(ah)) = +log10(ahFreeToSWSFactor...)
  pK1 = pK1 + Math.log10(ahFreeToSwsFactor(sal, temp, 0.0));

  // // ?? nb = no concentration scale conversion needed, as both on molinity [sic]

  return Math.pow(10, -pK1); // // K1
};

// // T- and S-dependent K2 from Millero et al. (2006)
// // ** pH scale = SWS for calculation
// // ** Return = K2 -- not pK2 -- on FREE pH scale

// // ----> nb = Millero (2010) slightly changes some coefficients =---

export const getK2 = (temp, sal, p) => {
  // if(is.null(sal))
  //   return()

  let sqrtS = Math.sqrt(sal);
  let lnT = Math.log(temp);

  let pK2z = -90.18333 + 5143.692 / temp + 14.613358 * lnT;

  let A = 21.0894 * sqrtS + 0.1248 * sal - 0.0003687 * sal * sal; // // was "21.08945"
  let B = -772.483 * sqrtS - 20.051 * sal;
  let C = -3.3336 * sqrtS; //  // was "-3.3336" or "3.32254"

  // // ** nb = THIS pK2 is on the SWS pH scale
  let pK2 = pK2z + A + B / temp + C * lnT;

  pK2 = pK2 + Math.log10(ahFreeToSwsFactor(sal, temp, 0.0));

  return Math.pow(10, -pK2);
};

export const calcDicOfAlk = (alk, ph, temp, sal) => {
  let m = phLineSlope(temp, sal, ph);

  let dic =
    (alk -
      calcHydroxide(ph, temp, sal) -
      calcBorate(ph, temp, sal) +
      calcHydronium(ph)) /
    m;
  return dic;
};

// used to insure that the unsafe CO2 region on the Deffeyes Dgm is filled properly
export const calcPhForCritCO2FromDIC = (dic, co2Crit, t, s) => {
  // dic must be > (not == to?) co2Crit
  if (dic <= co2Crit) {
    return;
  }

  // calculate pH at which, for a given DIC, [CO2] exceeds the entered CO2Crit

  const k1 = getK1(t, s);
  const k2 = getK2(t, s);

  const a = co2Crit - dic;
  const b = co2Crit * k1;
  const c = co2Crit * k1 * k2;

  const discrim = b * b - 4 * a * c;

  // NB: Want 'negative' of sqrt to insure 'positive' result (denom is negative -- always here?)
  const x = (-b - Math.sqrt(discrim)) / (2 * a);

  return -Math.log10(x);
};

// ** Calcite Saturation ** //

// [CHECK]
// 25 C, 33 ppt
// [Alk] = 2.0, pH NBS = 7.803199, pH FREE = 7.773796
// Ca = 9.6945 mmol/kg
// Results: Ω-ca 2.069959, Ω-ar 1.359001

// @param ca input units: ["mg/kg", "mg/L", "mmol/kg", "mmol/L"]
// return: mol/kg
// Ex: 463.0 mg/L =>           0.011303558407068858 mol/kg
// from full-stack WQ ToolBox: 0.011305643595685043
export const convertCaToMolesPerKg = (caVal, caUnits, t, s) => {
  // console.log(`In Brains...${caVal} ${caUnits}`);
  const mwCa = 40.078;
  if (caUnits === "mg/L") {
    // console.log(`--> ${caVal / 40.078 / calcRho(t, s)} mmol/kg =-`);
    return caVal / mwCa / calcRho(t, s);
  }
  if (caUnits === "mg/kg (ppm)") {
    return caVal / 1000 / mwCa;
  }
  if (caUnits === "mmol/L") {
    return caVal / calcRho(t, s);
  }
  if (caUnits === "mmol/kg") {
    return caVal / 1000.0;
  }
};

export const convertCaToMolesPerKgToAllUnits = (caInMolPerKg, t, s) => {
  // console.log(`In Brains...${caVal} ${caUnits}`);
  const mwCa = 40.078;
  const rho = calcRho(t, s);

  // "mg/kg"
  const mgPerKg = caInMolPerKg * mwCa * 1000; // [mol/kg] * [g/mol] * [mg/g]

  // "mg/L"
  const mgPerL = mgPerKg * rho * 0.001; // [mg/kg] * [g/L] * [kg/g]

  // "mmol/kg"
  const molPerKg = caInMolPerKg * 1000; // [mol/kg] * [1000 mmol/mol]

  //"mmol/L"
  const molPerL = caInMolPerKg * rho; // [mol/kg] * [g/L] * ([kg/g] * [1000 mmol/mol])

  // [NB] Added zeros for placeholders in calcium selection list (e.g., "by Mass-disabled")
  return [0, mgPerKg, mgPerL, 0, molPerKg, molPerL];
};

export const calcCO3 = (dic, t, s, ph) => {
  let carbonate = dic * alphaTwo(t, s, ph);

  return carbonate;
};

// Compare with Plummer & Busenberg (1982) formula used in Wojtowicz swimming pool
// paper "A Revised and Updated Saturation Index Equation",
// J. Swimming Pool & Spa Industry, 3(1):28 - 34
// log(Ks) =  -171.9065 - 0.077993*T + 2839.319/T + 71.595*log(T)
// NB: It's the SAME as calcKspCa(myTemp, 0.00), eh?
// from Mucci (1983)
// concentration scale: mol^2 / kg-soln^2

export const calcKspCa = (t, s) => {
  // In old app(s), t += 273.15;   // convert from C to K
  // Here, pass in icTemp in K, so change it to C??
  // t -= 273.15;

  let omegaCa = -171.9065;
  omegaCa = omegaCa + -0.77712 * Math.sqrt(s);
  omegaCa = omegaCa + -0.07711 * s;
  omegaCa = omegaCa + 0.0041249 * Math.pow(s, 1.5);

  omegaCa = omegaCa + (2839.319 + 178.34 * Math.sqrt(s)) / t;

  omegaCa = omegaCa + 71.595 * Math.log10(t);

  omegaCa = omegaCa + (-0.077993 + 0.0028426 * Math.sqrt(s)) * t;

  return Math.pow(10, omegaCa);
};

export const calcKspAr = (t, s) => {
  //	t += 273.15;   // convert from C to K
  // Here, pass in icTemp in K, so change it to C??
  // t -= 273.15;

  let omegaAr = -171.945;
  omegaAr = omegaAr + -0.068393 * Math.sqrt(s);
  omegaAr = omegaAr + -0.10018 * s;
  omegaAr = omegaAr + 0.0059415 * Math.pow(s, 1.5);

  omegaAr = omegaAr + (2903.293 + 88.135 * Math.sqrt(s)) / t;

  omegaAr = omegaAr + 71.595 * Math.log10(t);

  omegaAr = omegaAr + (-0.077993 + 0.0017276 * Math.sqrt(s)) * t;

  return Math.pow(10, omegaAr);
};

// NB: Which pH scale? NBS? FREE?
export const calcOmegaCa = (dic, ca, t, s, ph) => {
  let result = ca * calcCO3(dic, t, s, ph);

  result = result / calcKspCa(t, s);

  return result;
};

export const calcOmegaAr = (dic, ca, t, s, ph) => {
  let result = ca * calcCO3(dic, t, s, ph);

  result = result / calcKspAr(t, s);

  return result;
};

// Mole fraction (mole %) of high-magnesium calcite: 4 - 30
// see: Woolsey & Millero (2012) J. Geo. Res. (Oceans) 117, C4
// and: Möller & de Lucia (2020) Geochemistry 80 The impact of Mg2+ ions on equilibration of Mg-Ca carbonates in groundwater and brines

// export const calcOmegaHighMgCalcity = (dic, ca, t, s, ph, mg, moleFraction) => {
//   let result = ca * calcCO3(dic, t, s, ph);
//   let result = ca * calcCO3(dic, t, s, ph);

//   result = result / calcKspMgCalcite(t, s);

//   return result;
// };

export const calcAlkOfDic = (dic, ph, temp, sal) => {
  let alk = dic * phLineSlope(temp, sal, ph);
  alk = alk + calcHydroxide(ph, temp, sal);
  alk = alk - calcHydronium(ph);
  alk = alk + calcBorate(ph, temp, sal);

  // //   print('----------')
  // //   print(alk)
  // //   print(phLineIntercept(temp,sal,ph) + dic*phLineSlope(temp,sal,ph))
  // //   print(1000*phLineIntercept(temp,sal,ph))
  // //   print(phLineSlope(temp,sal,ph))
  // //   print('----------')

  return alk;
};

// [NEW OMEGA calc for iQuaCalc] ----
// [TRY THIS] calculate pH (and then [Alk]) for DIC and saturation omega-calcite
export const calc_ph_omega_ca_given_dic = (dic, ic_ca, ic_temp, ic_sal) => {
  // treat as a quadratic...

  const k1_times_k2 = getK1(ic_temp, ic_sal, 0) * getK2(ic_temp, ic_sal, 0);

  const a = 1.0;

  const b = k1_times_k2;

  const c =
    k1_times_k2 - (dic * k1_times_k2 * ic_ca) / calcKspCa(ic_temp, ic_sal);

  const h_plus = (-b + Math.sqrt(b ^ (2 - 4 * a * c))) / (2 * a);

  const ph_crit = -Math.log10(h_plus);

  return ph_crit;

  // cat('critical pH for Ω-calcite = ', ph_crit, ' (scale? Total?) \n')
};

// ***OLD [??]*** Omega boundary calc ----
// calc the pH at which, for given DIC, T, S, & P, Omega-Ca = omega
// mais, en reflechissant, c'est peut-etre plus pratique en avoir un autre ou on y
// passe les K1- & K2-sub-i, qui ne changeront pas ici (donné que t, s, & p ne changent pas)
// alors, en calculant la ligne dans le diagrame pour omega, tout ce qu'il faut y passer,
// c'est le DIC (qui change svakom korakom)...et les "constants" K1(T, S, P) et K2(T, S, P)
// (voir ci-dessous)
export const calcPhTotForOmegaCa = (omega, dic, ca, t, s, p) => {
  const K1 = getK1(t, s, p);
  const K2 = getK2(t, s, p);
  const Ksp = calcKspCa(t, s);
  //        double Ca  = calcKsyCa(t, s);

  // Ca = convertCaToMolesPerKg(ca, t, s)    // [mol/kg-soln] & 40.078 g/mol
  // Ca  = calcSWCa(s)
  // cat('Ca - ', Ca, 'mol/kg-soln \n')
  // 0.01028 mol/kg-soln @ 19.374C & 35 psu,
  // Riley & Tongudai (1967)

  // **********************************************************************
  // **********************************************************************

  // if (s < 5) ca = 0.01028 / 100.0; // CHEAP KLUDGE for freshwater

  // **********************************************************************
  // **********************************************************************

  // Implement the secant algorithm
  const q4 = 0.0;
  const q3 = 0.0;
  const q2 = 1.0;
  const q1 = K1;
  const q0 = K1 * K2 * (1.0 - (ca * dic) / (omega * Ksp));

  // **************************************** //
  let thePh = calcSecantMethod(q4, q3, q2, q1, q0);

  thePh = -Math.log10(thePh);
  // **************************************** //
  // cat("QUADRATIC Secant pH (Ca): ", thePh, '\n')
  // cat("Ca -> (DIC, [Alk]) = (", dic, ", ", calcAlkOfDicPhTempSal(dic, thePh, t, s), ")\n")

  // solve the quadratic with the quadratic formula
  let root = (-q1 + Math.sqrt(q1 * q1 - 4 * q0)) / 2;
  // cat("root: ", root, '\n')
  root = -Math.log10(root);
  // cat("Ca-secant pH: ", thePh, " vs quadForm pH: ", root, '\n\n')
  // console.log(`Secant: ${thePh} vs. Quaddratic: ${root}`);

  return root;
};

export const calcPhTotForOmegaAr = (omega, dic, ca, t, s, p) => {
  const K1 = getK1(t, s, p);
  const K2 = getK2(t, s, p);
  const Ksp = calcKspAr(t, s);

  // Ca = convertCaToMolesPerKg(ca, t, s)    // [mol/kg-soln] & 40.078 g/mol
  // Ca  = calcSWCa(s)
  // cat('Ca - ', Ca, 'mol/kg-soln \n')
  // 0.01028 mol/kg-soln @ 19.374C & 35 psu,
  // Riley & Tongudai (1967)

  // **********************************************************************
  // **********************************************************************

  // if (s < 5) ca = 0.01028 / 100.0; // CHEAP KLUDGE for freshwater

  // **********************************************************************
  // **********************************************************************

  // Implement the secant algorithm
  const q4 = 0.0;
  const q3 = 0.0;
  const q2 = 1.0;
  const q1 = K1;
  const q0 = K1 * K2 * (1.0 - (ca * dic) / (omega * Ksp));

  // **************************************** //
  let thePh = calcSecantMethod(q4, q3, q2, q1, q0);

  thePh = -Math.log10(thePh);
  // **************************************** //
  // cat("QUADRATIC Secant pH (Ca): ", thePh, '\n')
  // cat("Ca -> (DIC, [Alk]) = (", dic, ", ", calcAlkOfDicPhTempSal(dic, thePh, t, s), ")\n")

  // solve the quadratic with the quadratic formula
  let root = (-q1 + Math.sqrt(q1 * q1 - 4 * q0)) / 2;
  // cat("root: ", root, '\n')
  root = -Math.log10(root);
  // cat("Ca-secant pH: ", thePh, " vs quadForm pH: ", root, '\n\n')
  // console.log(`Secant: ${thePh} vs. Quaddratic: ${root}`);

  return root;
};

// to plot Omega = 1 (saturation) curve
// @param omega set equal to 1.0 (for now; later, maybe user-entered)
// @param ic_temp in K
// @param ic_sal in ppt
// @param ic_ca, calcium in mole/kg-soln
const draw_omega_isopleth_ca = (omega, ic_temp, ic_sal, ic_ca) => {
  // now set omega_ca_prime to "1.0"
  const omega_ca_prime = 1.0;

  // define starting DIC
  const dic_crit_omega_ca =
    (calcKspCa(ic_temp, ic_sal) * omega_ca_prime) / ic_ca;
  //cat('dic_crit_omega_ca = ', dic_crit_omega_ca, 'mol/kg \n')

  // compute pH for dicCritOmegaCa and omega_ca_prime for T, S, & pressure
  const ph_crit_start = calcPhTotForOmegaCa(
    omega_ca_prime,
    dic_crit_omega_ca,
    ic_ca,
    ic_temp,
    ic_sal,
    0
  );
  // cat('    ph_crit_start = ', ph_crit_start, ' \n')

  let my_dic = dic_crit_omega_ca;

  while (my_dic < 0.005) {
    const my_ph = calc_ph_omega_ca_given_dic(my_dic, ic_ca, ic_temp, ic_sal);
    const my_alk = calcAlkOfDic(my_dic, my_ph, ic_temp, ic_sal);
    // const my_alk = calcAlkOfDicPhTempSal(my_dic, my_ph, ic_temp, ic_sal)
    // cat('my_dic = ', my_dic, ', my_alk', my_alk, ', pH = ', my_ph, '\n')

    // ph_crit_start = calcPhTotForOmegaCa(omega_ca_prime, my_dic,
    //                                      ic_ca,
    //                                      ic_temp, ic_sal, 0)
    my_dic = my_dic + 0.0002;
  }
};

// ---- Convert [ALK] ----

// convert input value to Internal Calc Units, meq/kg
// meq/kg
// meq/L
// ppm CaCO3
// dKH
export const alkToIcUnits = (alk, alkUnits, my_rho) => {
  if ("meq/kg" === alkUnits) {
    return alk;
  }

  if ("meq/L" === alkUnits) {
    // [1000 g/kg] * [meq/L] / [g/L]
    return (1000.0 * alk) / my_rho;
  }

  // if('ppm-m CaCO3 (mg/kg)' === alkUnits) {
  const subThree = "\u2083";
  if ("ppm CaCO3" === alkUnits || "ppm CaCO" + subThree === alkUnits) {
    return alk / 50.04345;
  }

  // if('ppm-v CaCO3 (mg/L)' === alkUnits) {
  if ("mg/L CaCO3" === alkUnits) {
    return (1000.0 * alk) / 50.04345 / my_rho;
  }

  if ("dKH" === alkUnits) {
    return alk / 2.8;
  }
};

// @alk in IC Units -- meq/kg
// @rho in IC Units -- g/L
// export const alkToAllUnits = (alk, rho) => {

//   meq_L = round(alk * rho, 4)
//   ppm_m = round(alk * 50.04345, 3)
//   ppm_v = round(alk * rho * 50.04345, 3)
//   dkh = round(alk * 2.8, 4)
//   alk = round(alk, 4)

//   df = [alk, meq_L, ppm_m, ppm_v, dkh]

//                   //  units = ['meq/kg (mmol/kg)', 'meq/L (mmol/L)',
//                   //            'mg/kg CaCO3', 'mg/L CaCO3',
//                   //            'dKH']

//   return(df)
// }

// ** SPECIFIC HEAT ** //
// D. T. Jamieson, J. S. Tudhope, R. Morris, and G. Cartwright, Desalination, 7(1), 23-30, 1969.
// K.G. Nayar, M. H. Sharqawy, L.D. Banchik and J. H. Lienhard V, Desalination, 390, 1-24, 2016. (http://web.mit.edu/seawater/)
// return: J/(kg * K)
export const calcSpecificHeat = (T, S, p = 0) => {
  // P0 = Psat;
  // P0(find(T<100)) = 0.101325;

  const T68 = 1.00024 * (T + 273.15); // convert from T_90 to T_68

  // const S_gkg = S;

  const A =
    5.328 - 9.76 * Math.pow(10, -2) * S + 4.04 * Math.pow(10, -4) * S * S;
  const B =
    -6.913 * Math.pow(10, -3) +
    7.351 * Math.pow(10, -4) * S -
    3.15 * Math.pow(10, -6) * S * S;
  const C =
    9.6 * Math.pow(10, -6) -
    1.927 * Math.pow(10, -6) * S +
    8.23 * Math.pow(10, -9) * S * S;
  const D =
    2.5 * Math.pow(10, -9) +
    1.666 * Math.pow(10, -9) * S -
    7.125 * Math.pow(10, -12) * S * S;
  const cp_sw_P0 =
    1000 * (A + B * T68 + C * (T68 * T68) + D * (T68 * T68 * T68));

  // console.log(`Specific Heat: ${cp_sw_P0}`);

  return cp_sw_P0;

  // // Pressure dependent terms; T_90 in °C and S in g/kg
  // const c1 = -3.1118;
  // const c2 = 0.0157;
  // const c3 = 5.1014 * Math.pow(10,-5);
  // const c4 = -1.0302 * Math.pow(10,-6);
  // const c5 = 0.0107;
  // const c6 = -3.9716 * Math.pow(10,-5);
  // const c7 = 3.2088 * Math.pow(10,-8);
  // const c8 = 1.0119 * Math.pow(10,-9);

  // const cp_sw_P = (P - P0)*(c1 + c2*T + c3*(T*T) + c4*(T*T*T) + S_gkg*(c5 + c6*T + c7*(T*T) + c8*(T*T*T)));

  // const cp = cp_sw_P0 + cp_sw_P;
};

// calc Latent Heat of Vaporization
// [1] M. H. Sharqawy, J. H. Lienhard V, and S. M. Zubair,
// Desalination and Water Treatment, 16, 354-380, 2010. (http://web.mit.edu/seawater/)
// IAPWS release on the Thermodynamic properties of ordinary water substance, 1996.
// @param: temp in C, @param: sal in ppt
// return: J/kg
export const calcLatentHeat = (temp, sal) => {
  console.log(`${temp} C (${typeof temp}), ${sal} ppt (${typeof sal})`);

  const a = [
    2500899.1412,
    -2369.1806479,
    0.26776439436,
    -0.0081027544602,
    -0.000020799346624,
  ];

  const hfg_w =
    a[0] +
    a[1] * temp +
    a[2] * temp * temp +
    a[3] * temp * temp * temp +
    a[4] * temp * temp * temp * temp;

  console.log(`hfg_w = ${hfg_w}`);
  const hfg = hfg_w * (1 - 0.001 * sal);

  return hfg;
};

// #################################
// # pragma mark - numerical methods
// #################################

// # ** For now, use f() as general QUARTIC (or cubic or quadratic)
// # ** to be solved by calcPhForAlkDic()...
export const fOfx = (x, a, b, c, d, e) => {
  return a * x * x * x * x + b * x * x * x + c * x * x + d * x + e;
};

// ** code the secant method to solve 2nd-, 3rd-, & 4th-degree polynomials
// [CAVEAT] Does not work well (or at all) when resultant pH > ~8
export const calcSecantMethod = (q4, q3, q2, q1, q0) => {
  // console.log("------------");
  // console.log(q4);
  // console.log(q3);
  // console.log(q2);
  // console.log(q1);
  // console.log(q0);
  // console.log("------------");
  // print('IN SECANT METHOD...')
  // ans = polyroot(c(q0, q1, q2, q3, q4))
  // print(ans)
  // cat('Evo')
  // ***************************************
  // Method to carry out the secant search
  // ***************************************

  // ** define the number of iterations
  const n = 500;
  const del = Math.pow(10, -10);
  const a = 0;
  const b = 40;

  // ** define the interval, dx, and ...
  let dx = (b - a) / 10;
  let x = (a + b) / 2;
  // ***************************************

  let k = 0;

  // ** increment the interval
  let x1 = x + dx;

  // ** while the increment is greater than the tolerance
  // ** and the iterations are less than the max number thereof
  // ** NB ** for iOS, MUST USE ---> fabs() <----, not abs() !!
  while (Math.abs(dx) > del && k < n) {
    const d = fOfx(x1, q4, q3, q2, q1, q0) - fOfx(x, q4, q3, q2, q1, q0);
    const x2 = x1 - (fOfx(x1, q4, q3, q2, q1, q0) * (x1 - x)) / d;

    x = x1;
    x1 = x2;
    dx = x1 - x;
    k = k + 1;
  }

  // if (k === n) {
  //   console.log(`Convergence not found after ${n} iterations, x1 = ${x1}`);
  // } else {
  //   console.log(`x1 = ${x1} after ${k} iterations`);
  // }

  return x1;
};

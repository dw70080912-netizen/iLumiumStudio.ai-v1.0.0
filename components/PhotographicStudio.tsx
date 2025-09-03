

import React, { useState, useEffect, useCallback } from 'react';
import type { ConsistencyProfile, PhotorealisticRequest, TimeOfDay, LightSource, LensType, SensorType, PhotographicStyle, UploadedImage, FilmStock, PhotoDefects, CameraAngle } from '../types';
import { StudioIcon, SparklesIcon, UploadIcon, XMarkIcon, LightBulbIcon, CameraIcon, ClipboardCopyIcon, ArrowPathIcon } from './icons';
import { getCameraScenePreview, analyzeImageStyle } from '../services/geminiService';

interface PhotographicStudioProps {
    profiles: ConsistencyProfile[];
    onGenerate: (request: PhotorealisticRequest) => void;
    isLoading: boolean;
    reusedImage: UploadedImage | null;
    onReusedImageConsumed: () => void;
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileToBase64 = (file: File): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        base64: base64String,
        mimeType: file.type,
        name: file.name,
      });
    };
    reader.onerror = (error) => reject(error);
  });
};

const APERTURE_VALUES = ["f/1.0", "f/1.2", "f/1.4", "f/1.8", "f/2.0", "f/2.2", "f/2.8", "f/3.5", "f/3.6", "f/4.0", "f/4.5", "f/5.0", "f/5.6", "f/6.3", "f/7.1", "f/8.0", "f/9.0", "f/10.0", "f/11.0", "f/13.0", "f/14.0", "f/16.0", "f/18.0", "f/20.0", "f/22.0"];
const SHUTTER_SPEED_VALUES = ["30s", "15s", "8s", "4s", "2s", "1s", "1/15s", "1/60s", "1/125s", "1/250s", "1/500s", "1/1000s", "1/2000s", "1/4000s", "1/8000s", "1/16000s", "1/32000s"];

const CAMERA_ANGLES = [
    {
        group: 'Nível/Altura', angles: [
            { id: 'eye_level', name: 'Nível do Olho' },
            { id: 'shoulder_level', name: 'Nível do Ombro' },
            { id: 'hip_level', name: 'Nível do Quadril' },
            { id: 'knee_level', name: 'Nível do Joelho' },
            { id: 'ground_level', name: 'Nível do Chão' },
        ]
    },
    {
        group: 'Angulação', angles: [
            { id: 'low_angle', name: 'Ângulo Baixo (Contrapicada)' },
            { id: 'high_angle', name: 'Ângulo Alto (Picada)' },
            { id: 'dutch_angle', name: 'Ângulo Holandês (Inclinado)' },
            { id: 'over_the_shoulder', name: 'Sobre o Ombro (OTS)' },
            { id: 'over_the_hip', name: 'Sobre o Quadril' },
        ]
    },
    {
        group: 'Distância/Enquadramento', angles: [
            { id: 'establishing_shot', name: 'Plano de Estabelecimento' },
            { id: 'extreme_wide_shot', name: 'Plano Geral Extremo (EWS)' },
            { id: 'wide_shot', name: 'Plano Geral (WS)' },
            { id: 'full_shot', name: 'Plano Inteiro (FS)' },
            { id: 'medium_wide_shot', name: 'Plano Americano (MWS)' },
            { id: 'cowboy_shot', name: 'Plano Cowboy' },
            { id: 'medium_shot', name: 'Plano Médio (MS)' },
            { id: 'medium_close_up', name: 'Plano Médio Próximo (MCU)' },
            { id: 'close_up', name: 'Primeiro Plano (CU)' },
            { id: 'extreme_close_up', name: 'Primeiríssimo Plano (ECU)' },
        ]
    },
    {
        group: 'Especial/Perspectiva', angles: [
            { id: 'pov_shot', name: 'Ponto de Vista (POV)' },
            { id: 'birds_eye_view', name: 'Visão de Pássaro (Top-down)' },
            { id: 'aerial_shot', name: 'Aéreo' },
            { id: 'arc_shot', name: 'Plano em Arco' },
            { id: 'dolly_zoom', name: 'Dolly Zoom (Efeito Vertigo)' },
        ]
    }
];

const CAMERA_DB = [
    { brand: 'Smartphones', cameras: [
        { id: 'apple_iphone_15_pro', name: 'Apple iPhone 15 Pro', type: 'smartphone' },
        { id: 'samsung_galaxy_s24_ultra', name: 'Samsung Galaxy S24 Ultra', type: 'smartphone' },
        { id: 'google_pixel_8_pro', name: 'Google Pixel 8 Pro', type: 'smartphone' },
        { id: 'oneplus_9_pro', name: 'OnePlus 9 Pro (Hasselblad Color)', type: 'smartphone' },
        { id: 'vivo_x70_pro_plus', name: 'Vivo X70 Pro+ (Gimbal)', type: 'smartphone' },
        { id: 'honor_magic_4_ultimate', name: 'Honor Magic 4 Ultimate', type: 'smartphone' },
        { id: 'nothing_phone_1', name: 'Nothing Phone (1)', type: 'smartphone' },
        { id: 'asus_rog_phone_6', name: 'Asus ROG Phone 6', type: 'smartphone' },
        { id: 'motorola_edge_40_pro', name: 'Motorola Edge 40 Pro', type: 'smartphone' },
        { id: 'oppo_find_n2_flip', name: 'Oppo Find N2 Flip', type: 'smartphone' },
        { id: 'tecno_phantom_x2_pro', name: 'Tecno Phantom X2 Pro', type: 'smartphone' },
        { id: 'honor_90', name: 'Honor 90 (200MP)', type: 'smartphone' },
        { id: 'realme_gt5_pro', name: 'Realme GT5 Pro', type: 'smartphone' },
        { id: 'lg_v40_thinq', name: 'LG V40 ThinQ (Triple Cam)', type: 'smartphone' },
        { id: 'asus_zenfone_5z', name: 'Asus ZenFone 5Z', type: 'smartphone' },
        { id: 'honor_view_20', name: 'Honor View 20 (Hole-punch)', type: 'smartphone' },
        { id: 'samsung_galaxy_fold', name: 'Samsung Galaxy Fold', type: 'smartphone' },
        { id: 'tcl_10_pro', name: 'TCL 10 Pro', type: 'smartphone' },
        { id: 'lg_v10', name: 'LG V10 (Dual Front Cam)', type: 'smartphone' },
        { id: 'blackberry_priv', name: 'BlackBerry Priv', type: 'smartphone' },
        { id: 'zte_axon_7', name: 'ZTE Axon 7', type: 'smartphone' },
        { id: 'oneplus_3t', name: 'OnePlus 3T', type: 'smartphone' },
        { id: 'moto_z_force', name: 'Moto Z Force (Moto Mods)', type: 'smartphone' },
        { id: 'sony_xperia_z1', name: 'Sony Xperia Z1 (G Lens)', type: 'smartphone' },
        { id: 'lg_g2', name: 'LG G2 (OIS)', type: 'smartphone' },
        { id: 'samsung_galaxy_note_3', name: 'Samsung Galaxy Note 3', type: 'smartphone' },
        { id: 'motorola_droid_x', name: 'Motorola Droid X', type: 'smartphone' },
        { id: 'htc_evo_4g', name: 'HTC Evo 4G', type: 'smartphone' },
    ]},
    { brand: 'Mirrorless (Digital)', cameras: [
      { id: 'canon_eos_r5', name: 'Canon EOS R5' },
      { id: 'nikon_z9', name: 'Nikon Z9' },
      { id: 'sony_a7_iv', name: 'Sony α7 IV' },
      { id: 'sony_a9_ii', name: 'Sony α9 II' },
      { id: 'fujifilm_x_t4', name: 'Fujifilm X-T4 (APS-C)' },
      { id: 'leica_m11', name: 'Leica M11 (Rangefinder)' },
      { id: 'leica_sl2', name: 'Leica SL2' },
      { id: 'om_system_om1', name: 'OM System OM-1 (M4/3)' },
      { id: 'panasonic_gh6', name: 'Panasonic Lumix GH6 (M4/3)' },
      { id: 'fujifilm_x_e1', name: 'Fujifilm X-E1' },
      { id: 'sony_nex_5', name: 'Sony NEX-5' },
      { id: 'canon_eos_m', name: 'Canon EOS M' },
      { id: 'nikon_1_j1', name: 'Nikon 1 J1' },
      { id: 'panasonic_gh1', name: 'Panasonic GH1' },
      { id: 'samsung_nx10', name: 'Samsung NX10' },
      { id: 'olympus_om_d_e_m5', name: 'Olympus OM-D E-M5' },
      { id: 'leica_sl', name: 'Leica SL (Typ 601)' },
      { id: 'panasonic_s1h', name: 'Panasonic S1H' },
      { id: 'canon_eos_r6', name: 'Canon EOS R6' },
      { id: 'nikon_z50', name: 'Nikon Z50' },
      { id: 'fujifilm_x_h1', name: 'Fujifilm X-H1' },
      { id: 'sigma_fp_l', name: 'Sigma fp L' },
      { id: 'sony_zv_e1', name: 'Sony ZV-E1' },
    ]},
    { brand: 'DSLR (Digital)', cameras: [
      { id: 'canon_eos_1dx_iii', name: 'Canon EOS-1D X Mark III' },
      { id: 'nikon_d850', name: 'Nikon D850' },
      { id: 'pentax_k1_ii', name: 'Pentax K-1 Mark II' },
      { id: 'canon_eos_7d', name: 'Canon EOS 7D' },
      { id: 'nikon_d300', name: 'Nikon D300' },
      { id: 'canon_eos_40d', name: 'Canon EOS 40D' },
      { id: 'nikon_d90', name: 'Nikon D90' },
      { id: 'pentax_k10d', name: 'Pentax K10D' },
      { id: 'sony_alpha_a900', name: 'Sony Alpha A900' },
      { id: 'canon_eos_6d', name: 'Canon EOS 6D' },
      { id: 'nikon_d600', name: 'Nikon D600' },
      { id: 'canon_eos_1ds_mark_iii', name: 'Canon EOS 1Ds Mark III' },
      { id: 'nikon_d3s', name: 'Nikon D3s' },
      { id: 'canon_eos_60d', name: 'Canon EOS 60D' },
      { id: 'nikon_d7000', name: 'Nikon D7000' },
      { id: 'pentax_k_5', name: 'Pentax K-5' },
      { id: 'sigma_sd1_merrill', name: 'Sigma SD1 Merrill' },
      { id: 'canon_eos_20da', name: 'Canon EOS 20Da (Astro)' },
      { id: 'nikon_df', name: 'Nikon Df' },
      { id: 'canon_eos_5ds_r', name: 'Canon EOS 5Ds R (50MP)' },
    ]},
    { brand: 'Médio Formato (Digital)', cameras: [
      { id: 'fujifilm_gfx_100s', name: 'Fujifilm GFX 100S' },
      { id: 'hasselblad_x1d_ii', name: 'Hasselblad X1D II 50C' },
      { id: 'phase_one_iq4', name: 'Phase One IQ4 150MP' },
      { id: 'hasselblad_x1d', name: 'Hasselblad X1D-50c' },
    ]},
    { brand: 'Compactas (Digital)', cameras: [
        { id: 'canon_powershot_s95', name: 'Canon PowerShot S95' },
        { id: 'panasonic_lumix_dmc_lx3', name: 'Panasonic Lumix DMC-LX3' },
        { id: 'nikon_coolpix_a', name: 'Nikon Coolpix A (APS-C)' },
        { id: 'ricoh_gxr', name: 'Ricoh GXR (Modular)' },
        { id: 'sony_cyber_shot_dsc_rx10', name: 'Sony Cyber-shot DSC-RX10' },
        { id: 'canon_powershot_elph', name: 'Canon PowerShot ELPH / IXUS' },
        { id: 'olympus_stylus_verve', name: 'Olympus Stylus Verve' },
        { id: 'casio_exilim_ex_s1', name: 'Casio Exilim EX-S1' },
        { id: 'kodak_easyshare_cx6230', name: 'Kodak EasyShare CX6230' },
        { id: 'fujifilm_finepix_x10', name: 'Fujifilm FinePix X10' },
        { id: 'panasonic_lumix_dmc_tz', name: 'Panasonic Lumix DMC-TZ / ZS' },
        { id: 'canon_powershot_pro1', name: 'Canon PowerShot Pro1' },
        { id: 'sony_cyber_shot_dsc_hx1', name: 'Sony Cyber-shot DSC-HX1' },
        { id: 'leica_d_lux', name: 'Leica D-Lux' },
        { id: 'samsung_ex1', name: 'Samsung EX1' },
        { id: 'nikon_coolpix_p1000', name: 'Nikon Coolpix P1000 (125x Zoom)' },
    ]},
    { brand: 'Filme (SLR)', cameras: [
        { id: 'canon_t90', name: 'Canon T90 (1986)' },
        { id: 'nikon_f4', name: 'Nikon F4 (1988)' },
        { id: 'canon_eos_1', name: 'Canon EOS-1 (1989)' },
        { id: 'minolta_dynax_9xi', name: 'Minolta Dynax 9xi (1992)' },
        { id: 'contax_ax', name: 'Contax AX (1996)' },
        { id: 'nikon_f5', name: 'Nikon F5 (1996)' },
        { id: 'canon_eos_3', name: 'Canon EOS-3 (1998)' },
        { id: 'nikon_f6', name: 'Nikon F6 (2004)' },
        { id: 'canon_eos_1v', name: 'Canon EOS-1V (2000)' },
        { id: 'pentax_mz_s', name: 'Pentax MZ-S (2001)' },
        { id: 'olympus_om_3', name: 'Olympus OM-3 (1983)' },
        { id: 'nikon_f100', name: 'Nikon F100 (1999)' },
        { id: 'canon_eos_30v', name: 'Canon EOS 30V/Elan 7N (2004)' },
        { id: 'minolta_maxxum_9', name: 'Minolta Maxxum 9 (1998)' },
        { id: 'yashica_fx_3', name: 'Yashica FX-3 (1975)' },
        { id: 'praktica_b200', name: 'Praktica B200 (1990)' },
    ]},
    { brand: 'Filme (Rangefinder/Compacta)', cameras: [
        { id: 'minolta_cle', name: 'Minolta CLE (1980)' },
        { id: 'konica_hexar', name: 'Konica Hexar (1993)' },
        { id: 'ricoh_gr10', name: 'Ricoh GR10 (1997)' },
        { id: 'fujifilm_klasse', name: 'Fujifilm Klasse (2000)' },
        { id: 'yashica_t5', name: 'Yashica T5 (1991)' },
        { id: 'nikon_l35af', name: 'Nikon L35AF (1983)' },
        { id: 'olympus_mju_i', name: 'Olympus µ[mju:]-I (1991)' },
        { id: 'leica_minilux', name: 'Leica Minilux (1995)' },
        { id: 'contax_tvs', name: 'Contax TVS (1994)' },
        { id: 'rollei_35', name: 'Rollei 35 (1966)' },
        { id: 'olympus_35_sp', name: 'Olympus 35 SP (1969)' },
        { id: 'yashica_lynx_14', name: 'Yashica Lynx 14 (f/1.4)' },
        { id: 'konica_auto_s3', name: 'Konica Auto S3 (1973)' },
    ]},
     { brand: 'Filme (Médio Formato)', cameras: [
        { id: 'hasselblad_503cw', name: 'Hasselblad 503CW' },
        { id: 'mamiya_c330', name: 'Mamiya C330 (TLR)' },
        { id: 'pentax_645', name: 'Pentax 645' },
        { id: 'bronica_gs_1', name: 'Bronica GS-1 (6x7)' },
        { id: 'fujifilm_gw690', name: 'Fujifilm GW690 ("Texas Leica")' },
        { id: 'kiev_88', name: 'Kiev 88' },
        { id: 'rolleicord', name: 'Rolleicord (TLR)' },
        { id: 'mamiya_m645', name: 'Mamiya M645' },
        { id: 'holga_120n', name: 'Holga 120N (Toy Camera)' },
        { id: 'diana_f_plus', name: 'Diana F+ (Toy Camera)' },
        { id: 'pentax_67ii', name: 'Pentax 67II' },
    ]},
    { brand: 'Filme & Instantâneo', cameras: [
      { id: 'polaroid_sx70', name: 'Polaroid SX-70 (Instantânea)' },
      { id: 'kodak_portra_400_film', name: 'Filme Kodak Portra 400' },
    ]}
];

const LENS_DB = [
    { brand: 'Canon', lenses: [
        { id: 'canon_rf_50', name: 'RF 50mm f/1.2 L USM' },
        { id: 'canon_ef_70_200', name: 'EF 70-200mm f/2.8L IS III USM' },
        { id: 'canon_ef_24_70', name: 'EF 24-70mm f/2.8L II USM' },
        { id: 'canon_ef_16_35_f4', name: 'EF 16-35mm f/4L IS USM' },
        { id: 'canon_ef_100_f28_macro', name: 'EF 100mm f/2.8L Macro IS USM' },
        { id: 'canon_ef_300_f28', name: 'EF 300mm f/2.8L IS II USM' },
        { id: 'canon_rf_100_500', name: 'RF 100-500mm f/4.5-7.1L IS USM' },
    ]},
    { brand: 'Nikon', lenses: [
        { id: 'nikon_z_70_200', name: 'Z 70-200mm f/2.8 VR S' },
        { id: 'nikon_afs_24_70', name: 'AF-S 24-70mm f/2.8E ED VR' },
        { id: 'nikkor_ai_s_50_f12', name: 'AI-S 50mm f/1.2 (Manual)' },
        { id: 'nikkor_af_d_85_f14', name: 'AF-D 85mm f/1.4' },
        { id: 'nikkor_pc_e_24_f35', name: 'PC-E 24mm f/3.5D ED (Tilt-Shift)' },
        { id: 'nikkor_afs_500_f56', name: 'AF-S 500mm f/5.6E PF ED VR' },
        { id: 'nikkor_z_14_30_f4', name: 'Z 14-30mm f/4 S' },
    ]},
    { brand: 'Sony', lenses: [
        { id: 'sony_fe_24_70_gm', name: 'FE 24-70mm f/2.8 GM II' },
        { id: 'sony_fe_70_200_gm', name: 'FE 70-200mm f/2.8 GM OSS II' },
        { id: 'sony_fe_12_24_f28', name: 'FE 12-24mm f/2.8 GM' },
        { id: 'sony_fe_35_f14', name: 'FE 35mm f/1.4 GM' },
        { id: 'sony_fe_90_f28_macro', name: 'FE 90mm f/2.8 Macro G OSS' },
        { id: 'sony_fe_200_600', name: 'FE 200-600mm f/5.6-6.3 G OSS' },
        { id: 'sony_fe_50_f12', name: 'FE 50mm f/1.2 GM' },
    ]},
    { brand: 'Fujifilm', lenses: [
        { id: 'fuji_xf_16_55', name: 'XF 16-55mm f/2.8 R LM WR' },
        { id: 'fuji_xf_50_140', name: 'XF 50-140mm f/2.8 R LM OIS WR' },
        { id: 'fuji_xf_35_f14', name: 'XF 35mm f/1.4 R' },
        { id: 'fuji_xf_90_f2', name: 'XF 90mm f/2 R LM WR' },
        { id: 'fuji_gf_45_f28', name: 'GF 45mm f/2.8 R WR (Médio Formato)' },
    ]},
    { brand: 'Sigma', lenses: [
        { id: 'sigma_14_f18_art', name: '14mm f/1.8 DG HSM Art' },
        { id: 'sigma_40_f14_art', name: '40mm f/1.4 DG HSM Art' },
        { id: 'sigma_150_600_cont', name: '150-600mm f/5-6.3 DG OS HSM Contemporary' },
        { id: 'sigma_18_50_f28_cont', name: '18-50mm f/2.8 DC DN Contemporary' },
    ]},
    { brand: 'Tamron', lenses: [
        { id: 'tamron_24_70_g2', name: 'SP 24-70mm f/2.8 Di VC USD G2' },
        { id: 'tamron_17_28_f28', name: '17-28mm f/2.8 Di III RXD' },
        { id: 'tamron_28_200', name: '28-200mm f/2.8-5.6 Di III RXD' },
    ]},
    { brand: 'Leica', lenses: [
        { id: 'leica_summilux_50', name: 'Summilux-M 50mm f/1.4 ASPH.' },
        { id: 'leica_apo_summicron_75', name: 'APO-Summicron-SL 75mm f/2 ASPH.' },
    ]},
    { brand: 'M4/3', lenses: [
        { id: 'olympus_pro_12_40', name: 'Olympus M.Zuiko 12-40mm f/2.8 PRO' },
        { id: 'panasonic_leica_25_f14', name: 'Panasonic Leica DG Summilux 25mm f/1.4' },
        { id: 'olympus_75_f18', name: 'Olympus M.Zuiko 75mm f/1.8' },
    ]},
    { brand: 'Outras Marcas', lenses: [
        { id: 'zeiss_distagon_15_f28', name: 'Zeiss Distagon T* 15mm f/2.8' },
        { id: 'voigtlander_65_f2_macro', name: 'Voigtländer APO-Lanthar 65mm f/2 Macro' },
        { id: 'samyang_135_f2', name: 'Samyang 135mm f/2 ED UMC' },
        { id: 'laowa_24_probe', name: 'Laowa 24mm f/14 Probe' },
    ]},
];

const SENSOR_DB = [
    { type: 'Formatos', sensors: [
        { id: 'medium_format_phase_one', name: 'Médio Formato (Phase One 53.4x40mm)' },
        { id: 'medium_format_cmos', name: 'Médio Formato (Padrão)' },
        { id: 'full_frame_cmos', name: 'Full-Frame CMOS' },
        { id: 'aps_c_fujifilm_x_trans', name: 'APS-C (Fujifilm X-Trans)' },
        { id: 'aps_c_cmos', name: 'APS-C CMOS' },
        { id: 'micro_four_thirds', name: 'Micro Four Thirds' },
        { id: 'sensor_1_inch', name: '1" (Tipo 1)' },
    ]},
    { type: 'Tecnologias', sensors: [
        { id: 'global_shutter_cmos', name: 'Global Shutter CMOS (Ação)' },
        { id: 'stacked_cmos', name: 'Stacked CMOS (Velocidade)' },
        { id: 'bsi_cmos', name: 'BSI CMOS (Baixa Luz)' },
        { id: 'ccd_sensor', name: 'CCD (Look Vintage)' },
        { id: 'smartphone_sensor', name: 'Sensor de Smartphone (Computacional)' },
    ]},
     { type: 'Sensores Pequenos', sensors: [
        { id: 'sensor_1_3_6_inch', name: '1/3.6" (Webcam/Segurança)' },
        { id: 'sensor_1_4_inch', name: '1/4" (Smartphone de Baixo Custo)' },
    ]}
];

const EXPORT_FORMATS = [
    { id: 'jpeg_srgb', name: 'JPEG (sRGB)', desc: 'Universal para web/visualização.' },
    { id: 'jpeg_adobergb', name: 'JPEG (Adobe RGB)', desc: 'Impressão com mais cores.' },
    { id: 'png_8bit', name: 'PNG (8-bit)', desc: 'Web com transparência, sem perdas.' },
    { id: 'png_16bit', name: 'PNG (16-bit)', desc: 'Qualidade máxima, sem perdas.' },
    { id: 'tiff_8bit', name: 'TIFF (8-bit)', desc: 'Padrão de impressão, sem perdas.' },
    { id: 'tiff_16bit', name: 'TIFF (16-bit)', desc: 'Arquivo mestre para edição pró.' },
    { id: 'raw_dng', name: 'RAW (DNG)', desc: 'Negativo digital, máxima flexibilidade.' },
];

const INITIAL_REQUEST_STATE: PhotorealisticRequest = {
    prompt: '',
    profileId: '',
    useProfileForConsistency: true,
    baseImageMode: 'consistency',
    numberOfImages: 1,
    autoEquip: false,
    generationEngine: 'imagen_4',
    environment: '',
    lighting: {
        timeOfDay: 'meio-dia',
        source: 'natural_daylight',
        quality: 'difusa',
        angle: 'frontal',
        intensity: 'media',
        fillLight: false,
        rimLight: false,
    },
    camera: {
        cameraBody: 'sony_a7_iv',
        lens: 'sony_fe_24_70_gm',
        sensor: 'full_frame_cmos',
        aperture: 'f/2.8',
        shutterSpeed: '1/250s',
        iso: 'ISO 100',
        lensDistortion: 'none',
        chromaticAberration: 'none',
        lensTilt: 'none',
        lensShift: 'none',
        cameraAngle: 'eye_level',
    },
    depthOfField: {
        focusPoint: 'Olhos do sujeito',
        bokehQuality: 'cremoso',
        bokehIntensity: 'medium',
    },
    style: {
        base: 'nenhum',
        customMix: '',
    },
    atmosphere: {
      type: 'none',
      density: 'medium',
      lightPhysics: '',
    },
    materialProperties: '',
    conceptual: {
        prompt: '',
        sequence: {
            type: 'none',
            description: '',
        }
    },
    output: {
        format: 'jpeg_srgb',
        quality: 85,
        filter: 'none',
        steps: 'medium',
        resolution: 'qhd',
    },
    film: {
        stock: 'none',
        defects: {
            dustAndScratches: false,
            lensFlare: 'none',
            cameraShake: 'none',
            lightLeaks: false,
            filmGrain: 'none',
            sensorSpots: false,
            negativeScratches: false,
        },
    },
};

const FormField: React.FC<{ label: string, description: string, children: React.ReactNode, sub?: boolean }> = ({ label, description, children, sub=false }) => (
    <div className={sub ? "pt-3" : "pt-3"}>
        <label className={`block font-bold text-white mb-1 ${sub ? 'text-xs' : 'text-sm'}`}>{label}</label>
        <p className="text-xs text-gray-400 mb-2">{description}</p>
        {children}
    </div>
);

const SelectInput: React.FC<{ value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode, disabled?: boolean }> = ({ value, onChange, children, disabled=false }) => (
     <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
    >
        {children}
    </select>
);

const CheckboxInput: React.FC<{checked: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, label: string, disabled?: boolean}> = ({checked, onChange, label, disabled=false}) => (
    <label className={`flex items-center space-x-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
        <input type="checkbox" checked={checked} onChange={onChange} disabled={disabled} className="form-checkbox h-4 w-4 bg-gray-700 border-gray-600 rounded text-blue-500 focus:ring-blue-500" />
        <span className="text-sm text-white">{label}</span>
    </label>
);

const AccordionItem: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-gray-700">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-3 px-1"
            >
                <h3 className="text-md font-bold text-white">{title}</h3>
                <svg
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="pb-4 px-1 space-y-4">
                    {children}
                </div>
            )}
        </div>
    );
};


export const PhotographicStudio: React.FC<PhotographicStudioProps> = ({ profiles, onGenerate, isLoading, reusedImage, onReusedImageConsumed }) => {
    const [request, setRequest] = useState<PhotorealisticRequest>(INITIAL_REQUEST_STATE);
    const [baseImages, setBaseImages] = useState<UploadedImage[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewText, setPreviewText] = useState<string | null>(null);

    const [showAnalyzer, setShowAnalyzer] = useState(false);
    const [analysisImage, setAnalysisImage] = useState<UploadedImage | null>(null);
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisError, setAnalysisError] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    useEffect(() => {
        if (reusedImage) {
            setBaseImages([reusedImage]);
            onReusedImageConsumed();
        }
    }, [reusedImage, onReusedImageConsumed]);
    
    // Load state from localStorage on mount
    useEffect(() => {
        const savedStateJSON = localStorage.getItem('photographicStudioState');
        if (savedStateJSON) {
            try {
                const savedState = JSON.parse(savedStateJSON);
                if (savedState.request) {
                     setRequest(prevState => {
                        const mergedState = { ...prevState, ...savedState.request };
                        mergedState.lighting = { ...prevState.lighting, ...(savedState.request.lighting || {}) };
                        mergedState.camera = { ...prevState.camera, ...(savedState.request.camera || {}) };
                        mergedState.depthOfField = { ...prevState.depthOfField, ...(savedState.request.depthOfField || {}) };
                        mergedState.style = { ...prevState.style, ...(savedState.request.style || {}) };
                        mergedState.atmosphere = { ...prevState.atmosphere, ...(savedState.request.atmosphere || {}) };
                        mergedState.conceptual = { ...prevState.conceptual, ...(savedState.request.conceptual || {}), sequence: { ...prevState.conceptual.sequence, ...(savedState.request.conceptual?.sequence || {}) } };
                        mergedState.output = { ...prevState.output, ...(savedState.request.output || {}) };
                        mergedState.film = { ...prevState.film, ...(savedState.request.film || {}), defects: { ...prevState.film.defects, ...(savedState.request.film?.defects || {}) } };
                        return mergedState;
                    });
                }
            } catch (error) {
                console.error("Failed to load Photographic Studio state from localStorage:", error);
                localStorage.removeItem('photographicStudioState');
            }
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        try {
            const stateToSave = { request };
            localStorage.setItem('photographicStudioState', JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save Photographic Studio state to localStorage:", error);
            if (error instanceof DOMException && (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
                setError("Não foi possível salvar as configurações. O armazenamento local está cheio.");
            }
        }
    }, [request]);

    const isSmartphone = CAMERA_DB.find(b => b.brand === 'Smartphones')?.cameras.some(c => c.id === request.camera.cameraBody);
    const isAutoEquip = request.autoEquip;

    const handleInputChange = (field: string, value: any) => {
        const keys = field.split('.');
        setRequest(prev => {
            const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
            let current = newState;
            for (let i = 0; i < keys.length - 1; i++) {
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newState;
        });
    };
    
    const handleReset = () => {
        localStorage.removeItem('photographicStudioState');
        setRequest(INITIAL_REQUEST_STATE);
        setBaseImages([]);
        setError(null);
        setPreviewText(null);
    };

    useEffect(() => {
        if (isSmartphone) {
            handleInputChange('camera.lens', 'smartphone_lens');
            handleInputChange('camera.sensor', 'smartphone_sensor');
            handleInputChange('camera.lensDistortion', 'none');
            handleInputChange('camera.chromaticAberration', 'none');
        }
    }, [isSmartphone, request.camera.cameraBody]);

     useEffect(() => {
        if (baseImages.length > 0) {
            handleInputChange('numberOfImages', 1);
        }
    }, [baseImages]);

    useEffect(() => {
        if (request.generationEngine === 'nano_experimental' || request.conceptual.sequence.type !== 'none') {
            handleInputChange('numberOfImages', 1);
        }
        if (request.conceptual.sequence.type !== 'none' && request.numberOfImages < 2) {
             handleInputChange('numberOfImages', 2);
        }
    }, [request.generationEngine, request.conceptual.sequence.type]);
    
    const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const files = Array.from(event.target.files);
            setError(null);
            if (files.length === 0) return;

            let filesToProcess = files;
            if (filesToProcess.length > 10) {
                setError('Máximo de 10 imagens. As extras foram ignoradas.');
                filesToProcess = filesToProcess.slice(0, 10);
            }
            
            const validFiles = filesToProcess.filter(file => ACCEPTED_IMAGE_TYPES.includes(file.type));
            if(validFiles.length !== filesToProcess.length) {
                setError('Apenas imagens JPG, PNG, e WEBP são suportadas.');
            }
            if(validFiles.length === 0) return;

            try {
                const uploadedImages = await Promise.all(validFiles.map(fileToBase64));
                setBaseImages(uploadedImages);

                if (request.baseImageMode === 'reference' && uploadedImages.length > 1) {
                    setBaseImages(uploadedImages.slice(0, 1));
                    setError('Modo de referência aceita apenas 1 imagem. Apenas a primeira foi usada.');
                }
            } catch (err) {
                setError('Erro ao ler arquivos. Por favor, tente novamente.');
                console.error(err);
            }
        }
    }, [request.baseImageMode]);

    const handleBaseImageModeChange = (mode: 'consistency' | 'reference') => {
        handleInputChange('baseImageMode', mode);
        if (mode === 'reference' && baseImages.length > 1) {
            setBaseImages(prev => prev.slice(0, 1));
            setError('Modo de referência ativado. Apenas a primeira imagem base foi mantida.');
        } else {
            setError(null);
        }
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!request.prompt.trim()) {
            setError('O campo "Ação Principal" é obrigatório.');
            return;
        }
         if (!request.environment.trim() && baseImages.length === 0) {
            setError('O campo "Ambiente e Cenário" é obrigatório para gerar novas imagens.');
            return;
        }
        setError(null);
        onGenerate({
            ...request,
            baseImages: baseImages.length > 0 ? baseImages : undefined,
            profileId: request.profileId || undefined
        });
    };

    const handlePreview = async () => {
        if (!request.prompt.trim()) {
            setError('O campo "Ação Principal" é obrigatório para a pré-visualização.');
            return;
        }
        if (!request.environment.trim() && baseImages.length === 0) {
            setError('O campo "Ambiente e Cenário" é obrigatório para a pré-visualização.');
            return;
        }
        setError(null);
        setPreviewText(null);
        setIsPreviewLoading(true);
        try {
            const description = await getCameraScenePreview(request);
            setPreviewText(description);
        } catch (err) {
            setError((err as Error).message || 'Falha ao gerar a pré-visualização.');
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleAnalysisFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setAnalysisError(null);
            setAnalysisResult(null);
            setAnalysisImage(null);

            if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
                setAnalysisError('Arquivo inválido. Por favor, envie uma imagem JPG, PNG ou WEBP.');
                return;
            }

            try {
                const uploadedImage = await fileToBase64(file);
                setAnalysisImage(uploadedImage);
            } catch (err) {
                setAnalysisError('Erro ao ler o arquivo. Por favor, tente novamente.');
            } finally {
                if (event.target) (event.target as any).value = '';
            }
        }
    }, []);

    const handleAnalyzeImage = async () => {
        if (!analysisImage) {
            setAnalysisError('Por favor, envie uma imagem primeiro.');
            return;
        }
        setIsAnalyzing(true);
        setAnalysisError(null);
        setAnalysisResult(null);
        try {
            const result = await analyzeImageStyle(analysisImage);
            setAnalysisResult(result);
        } catch (err) {
            setAnalysisError((err as Error).message || 'Ocorreu um erro inesperado durante a análise.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleCopyAnalysis = () => {
        if (analysisResult) {
            navigator.clipboard.writeText(analysisResult);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };


    return (
        <div className="p-4 bg-gray-800 flex flex-col h-full">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-white flex items-center"><StudioIcon className="w-6 h-6 mr-2 text-blue-400" /> Estúdio Fotográfico</h2>
                <button
                    onClick={handleReset}
                    title="Resetar Configurações"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors"
                >
                    <ArrowPathIcon className="w-5 h-5" />
                </button>
            </div>
            <p className="text-sm text-gray-400 my-4">
                Aja como um diretor de fotografia. Defina cada detalhe da cena, câmera, lente e iluminação para criar ou editar imagens fotorrealistas.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 flex-grow overflow-y-auto pr-2 -mr-2">
                
                <AccordionItem title="1. Sujeito e Cenário" defaultOpen>
                    <div className="space-y-3">
                         <FormField label="Modo de Operação" description="Escolha entre controle manual total ou deixe a IA escolher o melhor equipamento para você.">
                            <label className="flex items-center p-3 bg-gray-700 rounded-lg cursor-pointer hover:bg-opacity-75 transition-colors">
                                <input 
                                    type="checkbox" 
                                    checked={request.autoEquip}
                                    onChange={(e) => handleInputChange('autoEquip', e.target.checked)}
                                    className="form-checkbox h-5 w-5 bg-gray-900 border-gray-600 rounded text-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-3">
                                    <span className="font-bold text-white">Equipagem Automática (Modo Diretor)</span>
                                    <span className="block text-xs text-gray-400">A IA escolhe a melhor câmera, lente e iluminação para seu prompt.</span>
                                </span>
                            </label>
                        </FormField>

                        <label className={`w-full flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${baseImages.length > 0 ? 'border-blue-500' : 'border-gray-600 hover:bg-gray-700'}`}>
                            <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-400 text-center">
                                {baseImages.length > 0 
                                    ? `${baseImages.length} imagem(ns) carregada(s). Clique para substituir.`
                                    : 'Opcional: Enviar imagem(ns) base para editar'
                                }
                            </span>
                            <input type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(',')} onChange={handleFileChange} className="hidden" />
                        </label>
                        {baseImages.length > 0 && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                    {baseImages.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img src={`data:${image.mimeType};base64,${image.base64}`} alt={`Base ${index + 1}`} className="w-full h-20 object-cover rounded-lg" />
                                            <button
                                                type="button"
                                                onClick={() => setBaseImages(prev => prev.filter((_, i) => i !== index))}
                                                className="absolute top-1 right-1 bg-black bg-opacity-50 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                                                aria-label="Remover imagem"
                                            >
                                                <XMarkIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                 <div className="p-2 bg-gray-700 rounded-md">
                                    <label className="text-sm font-bold text-white mb-2 block text-center">Modo da Imagem Base:</label>
                                    <div className="flex items-center p-1 bg-gray-900 rounded-full">
                                        <button
                                            type="button"
                                            onClick={() => handleBaseImageModeChange('consistency')}
                                            className={`flex-1 text-center px-3 py-1 text-xs rounded-full transition-colors ${request.baseImageMode === 'consistency' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                        >
                                            Manter Sujeito (Edição)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleBaseImageModeChange('reference')}
                                            className={`flex-1 text-center px-3 py-1 text-xs rounded-full transition-colors ${request.baseImageMode === 'reference' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                        >
                                            Referência (Inspiração)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                        <textarea value={request.prompt} onChange={(e) => handleInputChange('prompt', e.target.value)} placeholder="Ação Principal (Ex: um retrato de um velho marinheiro)" rows={2} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                        <textarea value={request.environment} onChange={(e) => handleInputChange('environment', e.target.value)} placeholder="Ambiente e Cenário (Ex: em um barco de pesca antigo)" rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                        <div className="relative">
                            <SparklesIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                             <SelectInput value={request.profileId || ''} onChange={(e) => handleInputChange('profileId', e.target.value)}>
                                <option value="">Usar um Perfil de Consistência (Opcional)</option>
                                {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </SelectInput>
                        </div>
                        {request.profileId && (
                            <div className="mt-2 p-2 bg-gray-700 rounded-md">
                                <div className="flex items-center justify-between">
                                <label className="text-sm font-bold text-white">Modo de Perfil:</label>
                                <div className="flex items-center p-1 bg-gray-900 rounded-full">
                                    <button
                                    type="button"
                                    onClick={() => handleInputChange('useProfileForConsistency', true)}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${request.useProfileForConsistency ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                    >
                                    Consistência
                                    </button>
                                    <button
                                    type="button"
                                    onClick={() => handleInputChange('useProfileForConsistency', false)}
                                    className={`px-3 py-1 text-xs rounded-full transition-colors ${!request.useProfileForConsistency ? 'bg-blue-600 text-white' : 'text-gray-400'}`}
                                    >
                                    Referência
                                    </button>
                                </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1 text-center">
                                {request.useProfileForConsistency
                                    ? 'Preserva a identidade exata do personagem/objeto do perfil.'
                                    : 'Usa o perfil apenas como inspiração de estilo e aparência.'}
                                </p>
                            </div>
                        )}
                    </div>
                </AccordionItem>
                 <AccordionItem title="2. Fotografia Conceitual e Narrativa">
                    <FormField label="Conceito Principal" description="Descreva ideias abstratas, emoções, sonhos, metáforas ou sentidos.">
                       <textarea 
                           value={request.conceptual.prompt} 
                           onChange={(e) => handleInputChange('conceptual.prompt', e.target.value)}
                           placeholder="Ex: uma foto que represente a sensação de nostalgia, simular uma memória de infância desfocada, um retrato que mostre a 'aura' de uma pessoa."
                           rows={4}
                           className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                        <div className="flex flex-wrap gap-1 mt-2">
                           {(['Simular um sonho', 'Visão de uma abelha (UV)', 'Fotografar o sentimento de solidão', 'Uma chama congelada em gelo']).map(preset => (
                               <button type="button" key={preset} onClick={() => handleInputChange('conceptual.prompt', preset)} className="text-xs bg-gray-600 px-2 py-1 rounded-md hover:bg-gray-500 transition-colors">
                                   {preset}
                               </button>
                           ))}
                       </div>
                    </FormField>
                    <FormField label="Sequência Narrativa" description="Se gerar múltiplas imagens, defina como elas se conectam entre si.">
                        <SelectInput value={request.conceptual.sequence.type} onChange={(e) => handleInputChange('conceptual.sequence.type', e.target.value)}>
                            <option value="none">Nenhuma Sequência</option>
                            <option value="timeline">Linha do Tempo (Evolução)</option>
                            <option value="style_variation">Variação de Estilo</option>
                            <option value="psychological_states">Estados Psicológicos</option>
                        </SelectInput>
                        {request.conceptual.sequence.type !== 'none' && (
                             <textarea 
                                value={request.conceptual.sequence.description} 
                                onChange={(e) => handleInputChange('conceptual.sequence.description', e.target.value)}
                                placeholder="Descreva a progressão da sequência. Ex: 'Anos 1920, anos 1980, ano 2100'"
                                rows={2}
                                className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                        )}
                    </FormField>
                </AccordionItem>
                <AccordionItem title="3. Iluminação">
                    <div className={isAutoEquip ? 'opacity-40 pointer-events-none' : ''}>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                            <SelectInput value={request.lighting.timeOfDay} onChange={(e) => handleInputChange('lighting.timeOfDay', e.target.value as TimeOfDay)} disabled={isAutoEquip}>
                                <optgroup label="Hora do Dia">
                                    <option value="amanhecer">Amanhecer</option>
                                    <option value="meio-dia">Meio-dia</option>
                                    <option value="por_do_sol">Pôr do Sol</option>
                                    <option value="hora_azul">Hora Azul</option>
                                    <option value="noite">Noite</option>
                                </optgroup>
                            </SelectInput>
                            <SelectInput value={request.lighting.source} onChange={(e) => handleInputChange('lighting.source', e.target.value as LightSource)} disabled={isAutoEquip}>
                                <optgroup label="Fonte Principal">
                                    <option value="natural_daylight">Luz Natural</option>
                                    <option value="golden_hour_sun">Sol (Golden Hour)</option>
                                    <option value="studio_flash">Flash de Estúdio</option>
                                    <option value="ring_light">Luz de Anel</option>
                                    <option value="neon_city">Neon de Cidade</option>
                                    <option value="dramatic_spotlight">Holofote Dramático</option>
                                    <option value="tungsten_bulb">Lâmpada de Tungstênio</option>
                                    <option value="fluorescent_light">Luz Fluorescente</option>
                                    <option value="led_panel">Painel de LED</option>
                                    <option value="candlelight">Luz de Vela</option>
                                </optgroup>
                            </SelectInput>
                            <SelectInput value={request.lighting.angle} onChange={(e) => handleInputChange('lighting.angle', e.target.value)} disabled={isAutoEquip}>
                                <optgroup label="Ângulo da Luz">
                                    <option value="frontal">Frontal</option>
                                    <option value="lateral">Lateral</option>
                                    <option value="contra-luz">Contra-luz</option>
                                    <option value="superior">Superior</option>
                                </optgroup>
                            </SelectInput>
                            <SelectInput value={request.lighting.quality} onChange={(e) => handleInputChange('lighting.quality', e.target.value)} disabled={isAutoEquip}>
                                <optgroup label="Qualidade da Luz">
                                    <option value="difusa">Difusa (Suave)</option>
                                    <option value="dura">Dura (Contraste)</option>
                                </optgroup>
                            </SelectInput>
                            <SelectInput value={request.lighting.intensity} onChange={(e) => handleInputChange('lighting.intensity', e.target.value)} disabled={isAutoEquip}>
                                <optgroup label="Intensidade">
                                    <option value="fraca">Fraca</option>
                                    <option value="media">Média</option>
                                    <option value="forte">Forte</option>
                                </optgroup>
                            </SelectInput>
                            <div className="flex items-center justify-around">
                                <CheckboxInput checked={request.lighting.fillLight} onChange={(e) => handleInputChange('lighting.fillLight', e.target.checked)} label="Preenchimento" disabled={isAutoEquip}/>
                                <CheckboxInput checked={request.lighting.rimLight} onChange={(e) => handleInputChange('lighting.rimLight', e.target.checked)} label="Contorno" disabled={isAutoEquip}/>
                            </div>
                        </div>
                    </div>
                </AccordionItem>
                 <AccordionItem title="4. Câmera e Lente">
                     <div className={isAutoEquip ? 'opacity-40 pointer-events-none' : ''}>
                        <div className="grid grid-cols-1 gap-3">
                             <SelectInput value={request.camera.cameraBody} onChange={(e) => handleInputChange('camera.cameraBody', e.target.value as string)} disabled={isAutoEquip}>
                                {CAMERA_DB.map(group => (
                                    <optgroup key={group.brand} label={group.brand}>
                                        {group.cameras.map(camera => <option key={camera.id} value={camera.id}>{camera.name}</option>)}
                                    </optgroup>
                                ))}
                            </SelectInput>
                            <SelectInput value={request.camera.cameraAngle} onChange={(e) => handleInputChange('camera.cameraAngle', e.target.value as CameraAngle)} disabled={isAutoEquip}>
                                {CAMERA_ANGLES.map(group => (
                                    <optgroup key={group.group} label={group.group}>
                                        {group.angles.map(angle => <option key={angle.id} value={angle.id}>{angle.name}</option>)}
                                    </optgroup>
                                ))}
                            </SelectInput>
                            <SelectInput value={request.camera.lens} onChange={(e) => handleInputChange('camera.lens', e.target.value as LensType)} disabled={isSmartphone || isAutoEquip}>
                                {LENS_DB.map(group => (
                                    <optgroup key={group.brand} label={group.brand}>
                                        {group.lenses.map(lens => <option key={lens.id} value={lens.id}>{lens.name}</option>)}
                                    </optgroup>
                                ))}
                            </SelectInput>
                             <SelectInput value={request.camera.sensor} onChange={(e) => handleInputChange('camera.sensor', e.target.value as SensorType)} disabled={isSmartphone || isAutoEquip}>
                            {SENSOR_DB.map(group => (
                                    <optgroup key={group.type} label={group.type}>
                                        {group.sensors.map(sensor => <option key={sensor.id} value={sensor.id}>{sensor.name}</option>)}
                                    </optgroup>
                                ))}
                            </SelectInput>
                             <div className="grid grid-cols-2 gap-2">
                                <SelectInput value={request.camera.aperture} onChange={(e) => handleInputChange('camera.aperture', e.target.value)} disabled={isSmartphone || isAutoEquip}>
                                    <optgroup label="Abertura (Desfoque)">
                                        {APERTURE_VALUES.map(f => <option key={f} value={f}>{f}</option>)}
                                    </optgroup>
                                </SelectInput>
                                <SelectInput value={request.camera.shutterSpeed} onChange={(e) => handleInputChange('camera.shutterSpeed', e.target.value)} disabled={isAutoEquip}>
                                    <optgroup label="Obturador">
                                        {SHUTTER_SPEED_VALUES.map(speed => <option key={speed} value={speed}>{speed}</option>)}
                                    </optgroup>
                                </SelectInput>
                            </div>
                            <SelectInput value={request.camera.iso} onChange={(e) => handleInputChange('camera.iso', e.target.value)} disabled={isAutoEquip}>
                                <optgroup label="ISO (Grão/Ruído)">
                                    <option value="ISO 50">ISO 50 (Limpo)</option>
                                    <option value="ISO 100">ISO 100</option>
                                    <option value="ISO 400">ISO 400</option>
                                    <option value="ISO 800">ISO 800</option>
                                    <option value="ISO 1600">ISO 1600 (Grão Leve)</option>
                                    <option value="ISO 3200">ISO 3200</option>
                                    <option value="ISO 6400">ISO 6400 (Grão Forte)</option>
                                </optgroup>
                            </SelectInput>
                             <input type="text" value={request.depthOfField.focusPoint} onChange={(e) => handleInputChange('depthOfField.focusPoint', e.target.value)} placeholder="Ponto de Foco (ex: olhos do sujeito)" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none" disabled={isAutoEquip} />
                            <div className="grid grid-cols-2 gap-2">
                                <SelectInput value={request.depthOfField.bokehQuality} onChange={(e) => handleInputChange('depthOfField.bokehQuality', e.target.value)} disabled={isAutoEquip}>
                                    <optgroup label="Qualidade do Bokeh">
                                        <option value="cremoso">Cremoso e Suave</option>
                                        <option value="nervoso">Nervoso e Distraído</option>
                                        <option value="vintage_remolino">Vintage (Swirly)</option>
                                    </optgroup>
                                </SelectInput>
                                <SelectInput value={request.depthOfField.bokehIntensity} onChange={(e) => handleInputChange('depthOfField.bokehIntensity', e.target.value)} disabled={isAutoEquip}>
                                    <optgroup label="Intensidade do Bokeh">
                                        <option value="subtle">Sutil</option>
                                        <option value="medium">Média</option>
                                        <option value="strong">Forte</option>
                                    </optgroup>
                                </SelectInput>
                            </div>
                        </div>
                    </div>
                 </AccordionItem>
                <AccordionItem title="5. Filme e Imperfeições">
                    <div className="space-y-3">
                        <SelectInput value={request.film.stock} onChange={(e) => handleInputChange('film.stock', e.target.value as FilmStock)}>
                            <optgroup label="Simulação de Filme">
                                <option value="none">Nenhum (Digital Limpo)</option>
                                <option value="kodak_portra_400">Kodak Portra 400</option>
                                <option value="fuji_velvia_50">Fuji Velvia 50</option>
                                <option value="ilford_hp5_400">Ilford HP5 400 (P&B)</option>
                                <option value="kodak_ektar_100">Kodak Ektar 100</option>
                                <option value="cinestill_800t">CineStill 800T</option>
                                <option value="polaroid_600">Polaroid 600</option>
                            </optgroup>
                        </SelectInput>
                        <div className="grid grid-cols-2 gap-4">
                             <SelectInput value={request.film.defects.filmGrain} onChange={(e) => handleInputChange('film.defects.filmGrain', e.target.value)}>
                                <optgroup label="Granulação de Filme">
                                    <option value="none">Nenhuma</option>
                                    <option value="fine">Fina</option>
                                    <option value="medium">Média</option>
                                    <option value="heavy">Pesada</option>
                                </optgroup>
                            </SelectInput>
                            <SelectInput value={request.film.defects.lensFlare} onChange={(e) => handleInputChange('film.defects.lensFlare', e.target.value)}>
                                <optgroup label="Lens Flare">
                                    <option value="none">Nenhum</option>
                                    <option value="subtle">Sutil</option>
                                    <option value="dramatic">Dramático</option>
                                    <option value="imperfect">Imperfeito</option>
                                </optgroup>
                            </SelectInput>
                             <SelectInput value={request.film.defects.cameraShake} onChange={(e) => handleInputChange('film.defects.cameraShake', e.target.value)}>
                                <optgroup label="Tremido da Câmera">
                                    <option value="none">Nenhum</option>
                                    <option value="slight">Leve</option>
                                    <option value="heavy">Forte (Movimento)</option>
                                </optgroup>
                            </SelectInput>
                            <div className="flex items-center justify-around flex-wrap gap-2">
                                <CheckboxInput checked={request.film.defects.lightLeaks} onChange={(e) => handleInputChange('film.defects.lightLeaks', e.target.checked)} label="Vazamento de Luz"/>
                                <CheckboxInput checked={request.film.defects.dustAndScratches} onChange={(e) => handleInputChange('film.defects.dustAndScratches', e.target.checked)} label="Poeira/Riscos"/>
                                <CheckboxInput checked={request.film.defects.sensorSpots} onChange={(e) => handleInputChange('film.defects.sensorSpots', e.target.checked)} label="Manchas no Sensor"/>
                                <CheckboxInput checked={request.film.defects.negativeScratches} onChange={(e) => handleInputChange('film.defects.negativeScratches', e.target.checked)} label="Riscos no Negativo"/>
                            </div>
                        </div>
                    </div>
                </AccordionItem>
                 <AccordionItem title="6. Atmosfera e Física">
                    <FormField label="Efeitos Atmosféricos" description="Adicione efeitos ambientais para criar profundidade e humor na cena.">
                        <div className="grid grid-cols-2 gap-2">
                            <SelectInput value={request.atmosphere.type} onChange={(e) => handleInputChange('atmosphere.type', e.target.value)}>
                                <option value="none">Sem Atmosfera</option>
                                <option value="fog">Neblina</option>
                                <option value="mist">Névoa / Bruma</option>
                                <option value="rain">Chuva</option>
                                <option value="dust_particles">Partículas de Poeira</option>
                            </SelectInput>
                            <SelectInput value={request.atmosphere.density} onChange={(e) => handleInputChange('atmosphere.density', e.target.value)} disabled={request.atmosphere.type === 'none'}>
                                <option value="light">Leve</option>
                                <option value="medium">Média</option>
                                <option value="heavy">Densa / Pesada</option>
                            </SelectInput>
                        </div>
                    </FormField>
                    <FormField label="Simulação Física (Avançado)" description="Descreva com precisão como a luz e os materiais devem se comportar.">
                         <textarea 
                            value={request.atmosphere.lightPhysics} 
                            onChange={(e) => handleInputChange('atmosphere.lightPhysics', e.target.value)} 
                            placeholder="Física da Luz (Ex: refração cáustica através de vidro, dispersão subsuperficial na pele, difração da luz em uma teia de aranha)" 
                            rows={3} 
                            className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                        <textarea 
                            value={request.materialProperties} 
                            onChange={(e) => handleInputChange('materialProperties', e.target.value)} 
                            placeholder="Propriedades dos Materiais (Ex: metal com reflexos anisotrópicos, tecido molhado translúcido, madeira com veios visíveis)" 
                            rows={3} 
                            className="mt-2 w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
                    </FormField>
                </AccordionItem>
                <AccordionItem title="7. Saída e Finalização">
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-xs font-bold text-white block mb-2">Passadas (Qualidade)</label>
                                <SelectInput value={request.output.steps} onChange={(e) => handleInputChange('output.steps', e.target.value)}>
                                    <option value="low">Baixa (Rápido)</option>
                                    <option value="medium">Média (Padrão)</option>
                                    <option value="high">Alta (Detalhado)</option>
                                    <option value="ultra">Ultra (Máxima)</option>
                                </SelectInput>
                            </div>
                             <div>
                                <label className="text-xs font-bold text-white block mb-2">Resolução (Simulada)</label>
                                <SelectInput value={request.output.resolution} onChange={(e) => handleInputChange('output.resolution', e.target.value)}>
                                    <option value="hd">HD (720p)</option>
                                    <option value="qhd">QHD (2K)</option>
                                    <option value="uhd4k">UHD (4K)</option>
                                    <option value="uhd8k">UHD (8K)</option>
                                </SelectInput>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">A IA simula resoluções mais altas com mais detalhes. O tamanho real do arquivo não muda.</p>
                         <div>
                            <label className="text-xs font-bold text-white block mb-2">Número de Imagens</label>
                            <input 
                                type="number" 
                                min="1" 
                                max="4" 
                                value={request.numberOfImages} 
                                onChange={(e) => {
                                    const num = parseInt(e.target.value, 10);
                                    if(request.conceptual.sequence.type !== 'none' && num < 2) {
                                        handleInputChange('numberOfImages', 2);
                                    } else {
                                        handleInputChange('numberOfImages', num);
                                    }
                                }} 
                                disabled={baseImages.length > 0 || request.generationEngine === 'nano_experimental'}
                                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed" 
                            />
                             {(baseImages.length > 0 || request.generationEngine === 'nano_experimental') && <p className="text-xs text-gray-500 mt-1">A edição de imagem e o motor experimental geram apenas 1 resultado.</p>}
                             {request.conceptual.sequence.type !== 'none' && <p className="text-xs text-gray-500 mt-1">Sequências narrativas precisam de pelo menos 2 imagens.</p>}
                        </div>
                    </div>
                </AccordionItem>
                {error && <p className="text-red-400 text-sm text-center py-2">{error}</p>}
                
                {previewText && (
                    <div className="my-4 p-3 bg-gray-900 rounded-md border border-gray-700 animate-fade-in">
                        <h4 className="font-bold text-sm text-blue-400 mb-2 flex items-center gap-2">
                            <LightBulbIcon className="w-5 h-5" />
                            Pré-visualização da Cena
                        </h4>
                        <p className="text-sm text-gray-400 whitespace-pre-wrap">{previewText}</p>
                    </div>
                )}
                <div className="pt-2 flex items-center gap-2 sticky bottom-0 bg-gray-800 py-2">
                    <button
                        type="button"
                        onClick={handlePreview}
                        disabled={isLoading || isPreviewLoading || !request.prompt.trim()}
                        className="w-1/3 bg-gray-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:bg-gray-900 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <LightBulbIcon className="w-5 h-5"/>
                        {isPreviewLoading ? '...' : 'Preview'}
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading || isPreviewLoading || !request.prompt.trim()} 
                        className="w-2/3 bg-blue-600 text-white font-semibold py-3 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (baseImages.length > 0 ? 'Editando...' : 'Gerando...') : (baseImages.length > 0 ? 'Editar Imagem' : 'Gerar Ensaio')}
                    </button>
                </div>
            </form>
        </div>
    );
};
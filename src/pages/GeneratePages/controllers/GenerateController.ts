import { Request, Response } from "express";
import OpenAI from "openai";
import { config as dotenv } from 'dotenv';
import ResponseCode from "../../../core/utils/ResponseCode";
import { ListGenerateText } from "../models/GenerateModel";
import GenerateRepository from "../../../core/repositories/Generate/GenerateRepository";
import ImageConvert from "../../../core/repositories/Convert/ImageConvert";

interface InterfacePrompt {
    prompt: string,
}


class GenerateController {

    public generateAiText = async(req: Request, res: Response) : Promise<Response> => {
        const OPENAI_KEY : string = process.env.OPENAI_KEY || '';
        const openai = new OpenAI({apiKey : OPENAI_KEY});
        
        try {
            const {prompt} : InterfacePrompt = req.body;

            if(!prompt) return ResponseCode.error(res, {
                code : 400,
                status : false,
                message : 'Prompt is required',
                result : null
            })

            const respText : any = await GenerateRepository.generateText(res, prompt);

            if(respText === false) return ResponseCode.error(res, respText.message);

            return ResponseCode.successGet(res, respText.data);

        } catch (e:any) {

            return ResponseCode.error( res, {
                code : 500,
                status : false,
                message : e.message,
                result : null
            })
            
        }

    }

    public generateAiImage = async(req: Request, res: Response) : Promise<Response> => {
        const OPENAI_KEY : string = process.env.OPENAI_KEY || '';
        const openai = new OpenAI({apiKey : OPENAI_KEY});

        try {

            const {prompt} : InterfacePrompt = req.body;

            if(!prompt) return ResponseCode.error(res, {
                code : 400,
                status : false,
                message : 'Prompt is required',
                result : null
            })

            const respImage : any = await GenerateRepository.generateImage(res, prompt);

            if(respImage === false) return ResponseCode.error(res, respImage.message);

            const respConvert :any = await ImageConvert.downloadImage(res, respImage.data);

            if(respConvert === false) return ResponseCode.error(res, respConvert.message);

            const respData : any = {
                urlimage : respConvert.data,
            }
            return ResponseCode.successGet(res, respData);

        }catch(err: any){
            return ResponseCode.error(res, {
                code : 500,
                status : false,
                message : err.message,
                result : null
            })
        }
    }
}

export default new GenerateController();
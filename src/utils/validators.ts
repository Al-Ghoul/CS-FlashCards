import { z } from "zod";


export const CardInputSchema = z.object({
  cover: z.string({ required_error: "A Cover is required for a card." })
    .min(5, "A Cover should be atleast 5 characters long."),
  content: z.string({ required_error: "Content is required for a card." })
    .min(5, "Card's content should be atleast 5 characters long."),
  public: z.boolean().optional(),
})

export type CardInputSchemaType = z.infer<typeof CardInputSchema>;


export const MainTopicInputSchema = z.object({
  name: z.string({ required_error: "A Name is required for a topic." })
    .min(5, { message: "A Name should be atleast 5 characters long." })
    .transform(data => data.toLowerCase())
  ,
})

export type MainTopicInputSchemaType = z.infer<typeof MainTopicInputSchema>;

export const MainTopicTranslationInputSchema = z.object({
  name: z.string({ required_error: "A Name is required to a topic translation." })
    .min(5, { message: "A Translation should be atleast 5 characters long." }),
})

export type MainTopicTranslationInputSchemaType = z.infer<typeof MainTopicTranslationInputSchema>;
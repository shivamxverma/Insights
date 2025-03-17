"use client";
import React from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "./ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "./ui/input";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { Plus, Trash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = { isPro: boolean };

const createChaptersSchema = z.object({
  title: z.string().min(3).max(100),
  units: z.array(z.string()),
});

type Input = z.infer<typeof createChaptersSchema>;

const CreateCourseForm = ({ isPro }: Props) => {
  const router = useRouter();

  const { mutate: createChapters, status } = useMutation({
    mutationFn: async ({ title, units }: Input) => {
      const response = await axios.post("/api/course/createChapters", {
        title,
        units,
      });
      return response.data;
    },
  });

  const form = useForm<Input>({
    resolver: zodResolver(createChaptersSchema),
    defaultValues: {
      title: "",
      units: ["", "", ""],
    },
  });

  function onSubmit(data: Input) {
    if (data.units.some((unit) => unit === "")) {
      toast.error( "Please fill all the units");
      return;
    }
    createChapters(data, {
      onSuccess: ({ course_id }) => {
        toast.success("Course created successfully",);
        router.push(`/create/${course_id}`);
      },
      onError: (error) => {
        console.error(error);
        toast.error("Something went wrong");
      },
    });
  }

  form.watch();

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <FormLabel className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300">
                  Course Title
                </FormLabel>
                <FormControl className="flex-1">
                  <Input
                    placeholder="Enter the main topic of the course"
                    {...field}
                    className="w-full py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <AnimatePresence>
            {form.watch("units").map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  opacity: { duration: 0.2 },
                  height: { duration: 0.2 },
                }}
              >
                <FormField
                  key={index}
                  control={form.control}
                  name={`units.${index}`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <FormLabel className="text-xl font-semibold text-gray-800 dark:text-gray-100 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-300">
                        Unit {index + 1}
                      </FormLabel>
                      <FormControl className="flex-1">
                        <Input
                          placeholder="Enter subtopic of the course"
                          {...field}
                          className="w-full py-3 text-base bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:border-blue-500 dark:focus:border-blue-300 transition-all duration-200 hover:shadow-md focus:shadow-lg"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-4 mt-6">
            <Separator className="flex-1 bg-gray-300 dark:bg-gray-600" />
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                className="font-semibold text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  form.setValue("units", [...form.watch("units"), ""]);
                }}
              >
                Add Unit
                <Plus className="w-4 h-4 ml-2 text-green-500 dark:text-green-400" />
              </Button>
              <Button
                type="button"
                variant="outline"
                className="font-semibold text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-600 dark:hover:bg-red-500 hover:text-white transition-all duration-300 transform hover:scale-105"
                onClick={() => {
                  form.setValue("units", form.watch("units").slice(0, -1));
                }}
                disabled={form.watch("units").length <= 3}
              >
                Remove Unit
                <Trash className="w-4 h-4 ml-2 text-red-500 dark:text-red-400" />
              </Button>
            </div>
            <Separator className="flex-1 bg-gray-300 dark:bg-gray-600" />
          </div>

          <Button
            disabled={status === "pending"}
            type="submit"
            className="w-full mt-8 py-3 font-semibold bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            size="lg"
          >
            {status === "pending" ? "Creating..." : "Let's Go!"}
          </Button>
        </form>
      </Form>
      {/* {!isPro && <SubscriptionAction />} */}
    </div>
  );
};

export default CreateCourseForm;
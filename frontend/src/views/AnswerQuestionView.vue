<template>
  <div
    class="flex flex-col bg-white max-w-6xl mx-auto rounded-lg p-10 shadow-md space-y-2"
  >
    <div>
      <h1 class="text-3xl font-bold text-gray-900 sm:text-4xl">
        {{ question.title }}
      </h1>
      <p class="mt-1">
        {{ new Date(question.createdAt).toLocaleDateString() }}
      </p>
    </div>
    <p class="text-lg font-normal text-justify">
      {{ question.description }}
    </p>
    <img
      src="https://via.placeholder.com/400x200?text=PLACEHOLDER"
      class="mx-auto mt-5 max-h-72"
      alt="Imagem questão"
    />
    <p class="text-lg font-semibold">Selecione uma alternativa:</p>
    <div class="grid grid-cols-2">
      <button
        @click="handleAnswerQuestion(alternative._id)"
        class="p-4 m-3 rounded-md shadow-sm text-base font-medium text-white bg-gray-700 hover:bg-gray-800 hover:scale-105 click:bg-gray-50"
        v-for="(alternative, index) in question.alternatives"
        :key="alternative.description"
        :class="{
          'bg-slate-500 ring ring-blue-300':
            alternative._id === selectedAlternativeId,
        }"
      >
        {{ getLetter(index) }} {{ alternative.description }}
      </button>
    </div>
    <div class="grid grid-cols-2">
      <div class="flex justify-start mt-5 text-lg">
        <button
          v-if="this.questionIndex > 0"
          @click="handlePreviousQuestion"
          class="flex justify-center items-center"
        >
          <v-icon icon="mdi-chevron-left"></v-icon>Anterior
        </button>
      </div>
      <div @click="handleNextQuestion" class="flex justify-end mt-5 text-lg">
        <button
          v-if="
            this.questionIndex !== this.$store.state.test.questions.length - 1
          "
          class="flex justify-center items-center"
        >
          Próxima<v-icon icon="mdi-chevron-right"></v-icon>
        </button>
        <button
          v-else
          @click="handleSubmitTest"
          class="flex justify-center items-center"
        >
          Finalizar<v-icon icon="mdi-check"></v-icon>
        </button>
      </div>
    </div>

    <div
      class="flex justify-end mt-4 font-semibold"
      v-if="message.type === 'error' || message.type === 'success'"
    >
      <div
        :class="message.type === 'error' ? 'text-red-400' : 'text-green-400'"
      >
        {{ message.text }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      selectedAlternativeId:
        this.$store.state.test.questions[this.$store.state.test.questionIndex]
          .answer,
      questionIndex: this.$store.state.test.questionIndex,
      question: {
        title: "",
        description: "",
        createdAt: "",
        alternatives: [
          {
            description: "",
          },
        ],
       
      },
      message: {
          type: "",
          text: "",
        },
    };
  },
  mounted() {
    this.handleGetQuestion();
  },
  watch: {
    questionIndex() {
      (this.selectedAlternativeId =
        this.$store.state.test.questions[
          this.$store.state.test.questionIndex
        ].answer);
        let index = this.$store.state.test.questionIndex;
        console.log(this.$store.state.test.questions)
        console.log(this.$store.state.test.questions[index])
        this.handleGetQuestion();
      this.message = {
        type: "",
        text: "",
      };
    },
  },
  methods: {
    handleGetQuestion() {
      axios
        .get(
          `${process.env.VUE_APP_API}/questions/${
            this.$store.state.test.questions[this.questionIndex].id
          }`,
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          this.question = response.data.question;
        });
    },
    getLetter(index) {
      return String.fromCharCode(97 + index) + ")";
    },
    handleAnswerQuestion(answer) {
      if (answer === this.selectedAlternativeId) {
        this.selectedAlternativeId = "";
        this.$store.dispatch("answerQuestion", {
          questionIndex: this.questionIndex,
          answer: "",
        });
        return;
      }
      this.$store.dispatch("answerQuestion", {
        questionIndex: this.questionIndex,
        answer: answer,
      });
      this.selectedAlternativeId = answer;
    },
    handleNextQuestion() {
      this.$store.dispatch("incrementQuestionIndex");
      this.questionIndex = this.$store.state.test.questionIndex;
    },
    handlePreviousQuestion() {
      this.$store.dispatch("decrementQuestionIndex");
      this.questionIndex = this.$store.state.test.questionIndex;
    },
    handleSubmitTest() {
      const isAllAnswersFilled = this.$store.state.test.questions.every(
        (question) => question.answer !== ""
      );
      if (!isAllAnswersFilled) {
        this.message.type = "error";
        this.message.text = "Você precisa responder todas as questões para finalizar o teste.";
        return;
      }
      axios
        .post(
          `${process.env.VUE_APP_API}/submissions`,
          {
            student: this.$store.state.user.id,
            subject: this.$store.state.test.subject,
            test: this.$store.state.test.id,
            questions: this.$store.state.test.questions,
          },
          {
            headers: {
              authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        )
        .then((response) => {
          if (response.status === 201 && response.statusText === "Created") {
            this.message.type = "success";
            this.message.text = "Teste realizado com sucesso";
            setTimeout(() => {
              this.$router.push("/student-subjects");
            }, 1500);
          }
        })
        .catch((error) => {
          if (error.response.data.validationError) {
            this.message.text = error.response.data.validationError;
            this.message.type = "error";
          } else {
            this.message.text = "Houve um erro ao realizar o teste";
            this.message.type = "error";
          }
        });
    },
  },
};
</script>

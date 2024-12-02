FROM golang:1.22.5

WORKDIR /app/server

COPY go.mod go.sum main.go /app/server/

RUN go mod download

RUN go build -o main ./main.go

EXPOSE 8080

CMD ["./main"]
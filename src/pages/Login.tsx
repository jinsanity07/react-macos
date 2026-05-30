import React, { useState } from "react";
import { wallpapers, user } from "~/configs";
import type { MacActions } from "~/types";
import { useStore } from "~/stores";
import SwitchUser from "~/components/SwitchUser";

export default function Login(props: MacActions) {
  const [password, setPassword] = useState("");
  const [sign, setSign] = useState("Click to enter");
  const dark = useStore((state) => state.dark);
  const [switchOpen, setSwitchOpen] = useState(false);

  const keyPress = (e: React.KeyboardEvent) => {
    const keyCode = e.key;
    if (keyCode === "Enter") loginHandle();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setPassword(e.target.value);
  };

  const loginHandle = () => {
    if (user.password === "" || user.password === password) {
      // not set password or password correct
      props.setLogin(true);
    } else if (password !== "") {
      // password not null and incorrect
      setSign("Incorrect password");
    }
  };

  function onSwitchSuccess(username: string) {
    props.setCurrentUserName?.(username);
    props.setCurrentUserAvatar?.("img/ui/avatar.jpg");
    props.setLogin(true);
  }

  return (
    <>
      <div
        className="size-full login text-center"
        style={{
          background: `url(${
            dark ? wallpapers.night : wallpapers.day
          }) center/cover no-repeat`
        }}
        onClick={() => loginHandle()}
      >
        <div className="inline-block w-auto relative top-1/2 -mt-40">
          {/* Avatar */}
          <img
            className="rounded-full size-24 my-0 mx-auto"
            src={props.currentUserAvatar || user.avatar}
            alt="img"
          />
          <div className="font-semibold mt-2 text-xl text-white">
            {props.currentUserName || user.name}
          </div>

          {/* Password Input */}
          <div className="mx-auto grid grid-cols-5 w-44 h-8 mt-4 rounded-md backdrop-blur-2xl bg-gray-300/50">
            <input
              className="text-sm text-white col-start-1 col-span-4 no-outline bg-transparent px-2"
              type="password"
              placeholder="Enter Password"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={keyPress}
              value={password}
              onChange={handleInputChange}
            />
            <div className="col-start-5 col-span-1 flex-center">
              <span className="i-bi:question-square-fill text-white ml-1" />
            </div>
          </div>

          <div mt-2 cursor-pointer text="sm gray-200">
            {sign}
          </div>

          <div className="mt-3">
            <button
              className="text-sm text-white/80 underline"
              onClick={(e) => {
                e.stopPropagation();
                setSwitchOpen(true);
              }}
            >
              Switch User…
            </button>
          </div>
        </div>

        {/* buttons */}
        <div className="text-sm fixed bottom-16 inset-x-0 mx-auto flex flex-row space-x-4 w-max">
          <div
            className="hstack flex-col text-white w-24 cursor-pointer"
            onClick={(e) => props.sleepMac(e)}
          >
            <div className="flex-center size-10 bg-gray-700 rounded-full">
              <span className="i-gg:sleep text-[40px]" />
            </div>
            <span>Sleep</span>
          </div>
          <div
            className="hstack flex-col text-white w-24 cursor-pointer"
            onClick={(e) => props.restartMac(e)}
          >
            <div className="flex-center size-10 bg-gray-700 rounded-full">
              <span className="i-ri:restart-line text-4xl" />
            </div>
            <span>Restart</span>
          </div>
          <div
            className="hstack flex-col text-white w-24 cursor-pointer"
            onClick={(e) => props.shutMac(e)}
          >
            <div className="flex-center size-10 bg-gray-700 rounded-full">
              <span className="i-ri:shut-down-line text-4xl" />
            </div>
            <span>Shut Down</span>
          </div>
        </div>
      </div>

      <SwitchUser
        open={switchOpen}
        onClose={() => setSwitchOpen(false)}
        onSuccess={onSwitchSuccess}
      />
    </>
  );
}
